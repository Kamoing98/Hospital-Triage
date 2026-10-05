import { Server, Cpu, Shield, Database, ArrowRight, CheckCircle, GitBranch } from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Architecture</h2>
        <p className="text-sm text-gray-500">
          Agent shape, MCP servers built vs. borrowed, and design decisions.
        </p>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-6">System Overview</h3>
        <div className="relative">
          {/* Flow diagram */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Input */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <Database size={24} className="mx-auto text-blue-600 mb-2" />
              <h4 className="text-xs font-semibold text-blue-800">Nurse Input</h4>
              <p className="text-[10px] text-blue-600 mt-1">Vitals + Complaint</p>
            </div>

            <ArrowRight size={16} className="hidden md:block mx-auto text-gray-300" />

            {/* Agent */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-center">
              <Cpu size={24} className="mx-auto text-emerald-600 mb-2" />
              <h4 className="text-xs font-semibold text-emerald-800">LangGraph Agent</h4>
              <p className="text-[10px] text-emerald-600 mt-1">Qwen2.5-72B (local)</p>
              <p className="text-[10px] text-emerald-600">Plans → Calls → Validates</p>
            </div>

            <ArrowRight size={16} className="hidden md:block mx-auto text-gray-300" />

            {/* Output */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <Shield size={24} className="mx-auto text-amber-600 mb-2" />
              <h4 className="text-xs font-semibold text-amber-800">Human Gate</h4>
              <p className="text-[10px] text-amber-600 mt-1">Nurse confirms</p>
              <p className="text-[10px] text-amber-600">before queue entry</p>
            </div>
          </div>

          {/* MCP Servers below */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3 text-center">MCP Servers (tools the agent calls)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-800">triage-mcp (CUSTOM)</span>
                </div>
                <ul className="text-[11px] text-gray-600 space-y-1 ml-4">
                  <li>• <code className="text-emerald-700">calculate_urgency_score</code> — SATS discriminator scoring</li>
                  <li>• <code className="text-emerald-700">check_deterioration_markers</code> — Compare vitals over time</li>
                  <li>• <code className="text-emerald-700">route_to_department</code> — Map priority to department</li>
                </ul>
              </div>
              <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-blue-800">hospital-records-mcp (COMMUNITY)</span>
                </div>
                <ul className="text-[11px] text-gray-600 space-y-1 ml-4">
                  <li>• <code className="text-blue-700">get_patient_history</code> — Known conditions, allergies, visits</li>
                </ul>
                <p className="text-[10px] text-gray-500 mt-2 italic">
                  Why community: Patient record access is a solved problem. Building our own FHIR/EHR connector wastes time better spent on triage logic.
                </p>
              </div>
            </div>
          </div>

          {/* Reference MCP */}
          <div className="mt-3">
            <div className="border border-purple-200 rounded-lg p-3 bg-purple-50/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs font-semibold text-purple-800">sats-reference-mcp (CUSTOM — read-only)</span>
              </div>
              <p className="text-[11px] text-gray-600 ml-4">
                <code className="text-purple-700">validate_against_scale</code> — Cross-references score against published SATS discriminator table. Ensures every priority is grounded in the scale, not invented.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Design Decisions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <GitBranch size={14} className="text-emerald-600" />
            Agent Shape
          </h3>
          <ul className="text-xs text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>LangGraph</strong> for orchestration — stateful graph with conditional edges for human gates</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Qwen2.5-72B</strong> (open-weights, run locally) — patient data never leaves the country</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Multi-step planning</strong>: fetch history → score → validate → route → gate</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Recovery</strong>: if validate fails, agent re-scores with adjusted discriminators</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Shield size={14} className="text-amber-600" />
            Safety & Compliance
          </h3>
          <ul className="text-xs text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Never diagnoses</strong> — scores priority only, cites the discriminator</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Never prescribes</strong> — no medication suggestions, no treatment plans</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Human gate on every irreversible action</strong> — priority, referral, deterioration flag</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Every priority cites its source</strong> — SATS discriminator + vitals that triggered it</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Deterioration = flag, not verdict</strong> — raises for re-check, cannot change queue position alone</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Why these choices */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Server size={14} className="text-blue-600" />
          Why These MCP Choices
        </h3>
        <div className="space-y-3 text-xs text-gray-600">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800 mb-1">Custom: triage-mcp (3 tools)</p>
            <p>This is the core intellectual work — SATS scoring, deterioration detection, department routing. No community MCP does this. Building it ourselves means the discriminator logic is transparent and auditable.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800 mb-1">Community: hospital-records-mcp</p>
            <p>Patient record retrieval is infrastructure, not innovation. Using a community MCP for FHIR/EHR access means we spend our time on triage logic, not reinventing database connectors. One line: it's a solved problem and our time is better spent on the scoring agent.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800 mb-1">Custom: sats-reference-mcp (read-only)</p>
            <p>Separating validation into its own tool means the scoring model can't silently drift from the published scale. If the reference table updates, only one MCP needs to change. Defense against audit: every score is independently verified against the source.</p>
          </div>
        </div>
      </div>

      {/* Data flow */}
      <div className="bg-gray-900 rounded-xl p-6 text-white">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Data Residency & Model Choice</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-emerald-400 font-semibold mb-1">OPEN-WEIGHTS MODEL</p>
            <p className="text-sm text-gray-300">Qwen2.5-72B runs on-premise. Patient health data never leaves the facility or the country.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-blue-400 font-semibold mb-1">SYNTHETIC DATA DEFAULT</p>
            <p className="text-sm text-gray-300">All demo data is synthetic. Real patient data requires explicit consent — never used without it.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-amber-400 font-semibold mb-1">FULL AUDIT TRAIL</p>
            <p className="text-sm text-gray-300">Every tool call logged: inputs, outputs, timestamps, named clinician who approved. Survives clinical audit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

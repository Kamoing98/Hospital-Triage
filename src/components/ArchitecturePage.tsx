import { Server, Cpu, Shield, Database, ArrowRight, CheckCircle, GitBranch, Layers, Terminal } from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Architecture</h2>
        <p className="text-sm text-gray-500">
          Agent shape, MCP servers built vs. borrowed, orchestration, and design decisions.
        </p>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-6">System Overview — End-to-End Flow</h3>
        <div className="relative">
          {/* Flow diagram */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <Database size={24} className="mx-auto text-blue-600 mb-2" />
              <h4 className="text-xs font-semibold text-blue-800">Nurse Input</h4>
              <p className="text-[10px] text-blue-600 mt-1">Vitals + Chief Complaint</p>
              <p className="text-[10px] text-blue-500">(React Dashboard)</p>
            </div>

            <ArrowRight size={16} className="hidden md:block mx-auto text-gray-300" />

            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-center">
              <Cpu size={24} className="mx-auto text-emerald-600 mb-2" />
              <h4 className="text-xs font-semibold text-emerald-800">LangGraph Agent</h4>
              <p className="text-[10px] text-emerald-600 mt-1">Qwen-2.5-72B-Instruct</p>
              <p className="text-[10px] text-emerald-600">via vLLM / Ollama (local)</p>
            </div>

            <ArrowRight size={16} className="hidden md:block mx-auto text-gray-300" />

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <Shield size={24} className="mx-auto text-amber-600 mb-2" />
              <h4 className="text-xs font-semibold text-amber-800">Human Gate</h4>
              <p className="text-[10px] text-amber-600 mt-1">Nurse confirms</p>
              <p className="text-[10px] text-amber-600">before queue update</p>
            </div>
          </div>

          {/* MCP Servers */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3 text-center">MCP Servers (tools & resources the agent calls via Stdio/SSE transport)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-800">triage-desk-mcp-server (CUSTOM · FastMCP)</span>
                </div>
                <p className="text-[10px] text-gray-500 mb-2">Built in Python using FastMCP SDK</p>
                <ul className="text-[11px] text-gray-600 space-y-1 ml-4">
                  <li>• <code className="text-emerald-700">score_triage_priority</code> — SATS composite scoring + citation</li>
                  <li>• <code className="text-emerald-700">raise_deterioration_flag</code> — Baseline vs. re-check delta</li>
                  <li>• <code className="text-emerald-700">route_department_referral</code> — Symptom → sub-queue mapping</li>
                </ul>
                <div className="mt-2 pt-2 border-t border-emerald-200">
                  <p className="text-[10px] text-gray-500 font-medium mb-1">Exposed Resource:</p>
                  <code className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">sats://guidelines/vitals_matrix</code>
                  <p className="text-[10px] text-gray-500 mt-1">Static SATS reference tables for inline LLM verification</p>
                </div>
              </div>
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-blue-800">@modelcontextprotocol/server-postgres (OFFICIAL)</span>
                </div>
                <p className="text-[10px] text-gray-500 mb-2">Borrowed — queue persistence & immutable audit logging</p>
                <ul className="text-[11px] text-gray-600 space-y-1 ml-4">
                  <li>• <code className="text-blue-700">execute_query</code> — Queue positions + audit records</li>
                </ul>
                <div className="mt-3 p-2 bg-blue-100/50 rounded">
                  <p className="text-[10px] text-blue-800 font-medium">Why borrowed over custom:</p>
                  <p className="text-[10px] text-blue-700 mt-0.5">
                    Reusing the battle-tested official Postgres MCP server guarantees standardized database connection pooling, query sanitization, and schema introspection without writing redundant database CRUD boilerplate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Loop Detail */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <GitBranch size={14} className="text-emerald-600" />
          Agent Loop — LangGraph State Machine
        </h3>
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <LoopStep num={1} title="Plan" desc="Analyzes raw vitals and chief complaints against structured clinical guidelines" />
          <LoopStep num={2} title="Execute" desc="Calls score_triage_priority to compute composite SATS scores with citations" />
          <LoopStep num={3} title="Verify" desc="Cross-checks output against sats://guidelines/vitals_matrix — every priority grounded in specific vitals" />
          <LoopStep num={4} title="Gate" desc="Pauses at Human-in-the-Loop node — named clinician must approve before state change" />
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <pre className="text-[11px] text-gray-300 font-mono overflow-x-auto">
{`LangGraph State Graph:
  START → intake_vitals → [tool_selection] → score_triage_priority
    → verify_against_sats → route_department_referral
    → human_gate (WAIT FOR NURSE) → execute_query (PostgreSQL)
    → queue_update → END

  Error Recovery:
    score_triage_priority → FAIL → adjust_discriminators → retry (max 2)
    verify_against_sats → MISMATCH → flag_for_manual_review → END`}
          </pre>
        </div>
      </div>

      {/* Design Decisions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Cpu size={14} className="text-emerald-600" />
            What Makes It Agentic
          </h3>
          <ul className="text-xs text-gray-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Autonomous tool calling via MCP</strong> — LLM dynamically determines when/how to invoke tools based on input payload, no hardcoded branching</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Multi-step reasoning + self-correction</strong> — Plan → Execute → Verify loop with error recovery (re-score with adjusted discriminators on validation failure)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Deterministic gatekeeping</strong> — Handles error recovery, formatting, multi-tool workflows autonomously while enforcing human gate on all state changes</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Not a chatbot</strong> — No single-turn completion. Stateful graph with conditional edges, tool discovery over Stdio/SSE transport</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Shield size={14} className="text-amber-600" />
            Safety & Non-Negotiables
          </h3>
          <ul className="text-xs text-gray-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Never diagnoses</strong> — scores priority only, cites the SATS discriminator + vitals that triggered it</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Never prescribes</strong> — no medication suggestions, no treatment plans</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Never moves patient without approval</strong> — mandatory UI validation node where agent pauses for named clinician</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Deterioration = flag, not verdict</strong> — raises for re-check, cannot change queue position alone</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Immutable audit trail</strong> — every MCP request/response/timestamp/clinician ID in PostgreSQL</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Layers size={14} className="text-blue-600" />
          Core Technology Stack
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StackCard category="Orchestration" items={['LangGraph', 'Pydantic AI']} />
          <StackCard category="LLM Serving" items={['vLLM', 'Ollama']} />
          <StackCard category="Open-Weights Models" items={['Qwen-2.5-72B-Instruct', 'Llama-3-70B-Instruct']} />
          <StackCard category="Protocol & Tooling" items={['Model Context Protocol', 'FastMCP Python SDK']} />
          <StackCard category="Backend" items={['Python 3.11+', 'FastMCP', 'Asyncio']} />
          <StackCard category="Database" items={['PostgreSQL (local)']} />
          <StackCard category="Frontend" items={['React / Next.js']} />
          <StackCard category="Infrastructure" items={['Docker', 'Linux CLI']} />
        </div>
      </div>

      {/* MCP Connection Detail */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Terminal size={14} className="text-purple-600" />
          MCP Connection to Agent Loop
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-800 mb-1">1. Client Initialization</p>
            <p className="text-[11px] text-gray-600">LangGraph agent initializes an <code className="text-purple-700 bg-purple-50 px-1 rounded">MCPClient</code> session upon receiving a triage intake event.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-800 mb-1">2. Tool Discovery & Selection</p>
            <p className="text-[11px] text-gray-600">Agent queries available MCP tools dynamically over <strong>Stdio/SSE transport</strong>. Based on input payload, formulates structured tool call payloads.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-800 mb-1">3. Execution & Gate</p>
            <p className="text-[11px] text-gray-600">When agent invokes <code className="text-emerald-700 bg-emerald-50 px-1 rounded">score_triage_priority</code>, the custom server executes deterministic calculation. Before committing state to PostgreSQL via the Postgres MCP server, the graph pauses at mandatory Human-in-the-Loop gate.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-800 mb-1">4. Immutable Logging</p>
            <p className="text-[11px] text-gray-600">Every MCP request, response payload, timestamp, and approving clinician ID is written to an immutable audit record in PostgreSQL.</p>
          </div>
        </div>
      </div>

      {/* Data Residency */}
      <div className="bg-gray-900 rounded-xl p-6 text-white">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Data Sovereignty & Infrastructure</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-emerald-400 font-semibold mb-1">OPEN-WEIGHTS MODEL</p>
            <p className="text-sm text-gray-300">Qwen-2.5-72B-Instruct served locally via vLLM/Ollama. Patient health data never leaves the facility or country.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-blue-400 font-semibold mb-1">NO CLOUD DEPENDENCY</p>
            <p className="text-sm text-gray-300">Unreliable internet + data protection regulations make cloud-only AI non-compliant. Entire stack runs on local hardware.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-amber-400 font-semibold mb-1">IMMUTABLE AUDIT</p>
            <p className="text-sm text-gray-300">Every tool call logged: inputs, outputs, timestamps, named clinician who approved. Survives clinical audit. PostgreSQL-backed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoopStep({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center">{num}</span>
        <span className="text-xs font-semibold text-gray-800">{title}</span>
      </div>
      <p className="text-[11px] text-gray-600">{desc}</p>
    </div>
  );
}

function StackCard({ category, items }: { category: string; items: string[] }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">{category}</p>
      {items.map((item, i) => (
        <p key={i} className="text-xs text-gray-800 font-mono">{item}</p>
      ))}
    </div>
  );
}

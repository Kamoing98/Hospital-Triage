import { Patient } from '../types';
import { PRIORITY_CONFIG } from '../data/syntheticPatients';
import { Activity, Users, AlertTriangle, Clock, CheckCircle, Shield, Database, Cpu } from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
}

export default function Dashboard({ patients }: DashboardProps) {
  const approved = patients.filter(p => p.approved).length;
  const pending = patients.filter(p => !p.approved).length;
  const deterioration = patients.filter(p => p.deteriorationFlag).length;
  const avgWait = Math.round(patients.filter(p => p.waitTimeMinutes > 0).reduce((a, p) => a + p.waitTimeMinutes, 0) / Math.max(1, patients.filter(p => p.waitTimeMinutes > 0).length));

  const priorityCounts = {
    red: patients.filter(p => p.priorityLevel === 'red').length,
    orange: patients.filter(p => p.priorityLevel === 'orange').length,
    yellow: patients.filter(p => p.priorityLevel === 'yellow').length,
    green: patients.filter(p => p.priorityLevel === 'green').length,
  };

  return (
    <div className="space-y-6">
      {/* Context Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1">TriageDesk MCP</h2>
            <p className="text-sm text-emerald-100 max-w-2xl">
              Agentic AI decision-support converting patient vitals & chief complaints into standardized, cited SATS urgency levels in seconds.
              Built on LangGraph + Qwen-2.5 + Model Context Protocol.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
            <div className="text-center">
              <p className="text-2xl font-bold">60–90</p>
              <p className="text-[10px] text-emerald-200">min current wait</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">&lt;10</p>
              <p className="text-[10px] text-emerald-200">sec agent score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="Patients in Queue" value={patients.length} color="emerald" />
        <StatCard icon={<CheckCircle size={20} />} label="Nurse-Confirmed" value={approved} color="blue" />
        <StatCard icon={<Clock size={20} />} label="Avg Wait (min)" value={avgWait} color="amber" />
        <StatCard icon={<AlertTriangle size={20} />} label="Deterioration Flags" value={deterioration} color="red" />
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Shield size={16} className="text-emerald-600" />
          SATS Priority Distribution (South African Triage Scale)
        </h3>
        <div className="space-y-3">
          {(['red', 'orange', 'yellow', 'green'] as const).map(level => {
            const config = PRIORITY_CONFIG[level];
            const count = priorityCounts[level];
            const pct = patients.length > 0 ? (count / patients.length) * 100 : 0;
            return (
              <div key={level} className="flex items-center gap-3">
                <div className="w-36">
                  <span className={`text-xs font-medium ${config.color}`}>{config.label.split('—')[0].trim()}</span>
                  <span className="text-[10px] text-gray-400 ml-1">{config.scoreRange}</span>
                </div>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      level === 'red' ? 'bg-red-500' :
                      level === 'orange' ? 'bg-orange-500' :
                      level === 'yellow' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-gray-600 w-8 text-right">{count}</span>
                <span className="text-[10px] text-gray-400 w-20">{config.targetTime}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column: Pending + Agent Config */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Approval */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-amber-600" />
            Awaiting Nurse Confirmation (Human Gate)
          </h3>
          {pending > 0 ? (
            <div className="space-y-3">
              {patients.filter(p => !p.approved).map(patient => (
                <div key={patient.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                    <p className="text-xs text-gray-500">{patient.complaint.primary}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                      Agent scored — awaiting sign-off
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">All priorities confirmed by clinician ✓</p>
          )}
        </div>

        {/* Agent Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Cpu size={16} className="text-emerald-600" />
            Agent Stack
          </h3>
          <div className="space-y-2.5 text-sm">
            <ConfigRow label="Orchestration" value="LangGraph + Pydantic AI" />
            <ConfigRow label="LLM Serving" value="vLLM / Ollama (local)" />
            <ConfigRow label="Open-Weights Model" value="Qwen-2.5-72B-Instruct" />
            <ConfigRow label="MCP SDK" value="FastMCP (Python)" />
            <ConfigRow label="Triage Scale" value="SATS (South African Triage Scale)" />
            <ConfigRow label="Custom MCP Tools" value="3 (score, flag, route)" />
            <ConfigRow label="Borrowed MCP" value="@modelcontextprotocol/server-postgres" />
            <ConfigRow label="Human-in-Loop Gate" value="Active ✓" highlight />
            <ConfigRow label="Data Residency" value="On-premise · In-country" />
            <ConfigRow label="Audit Store" value="PostgreSQL (immutable)" />
          </div>
        </div>
      </div>

      {/* Regional Context */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Database size={16} className="text-blue-600" />
          Designed for African Public Hospital OPDs
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <ContextCard title="SATS Protocol" text="Built on the South African Triage Scale — validated for resource-constrained African emergency & outpatient settings" />
          <ContextCard title="Staff Ratios" text="Automates composite vital scoring arithmetic, freeing nurses for clinical oversight instead of data entry" />
          <ContextCard title="Data Sovereignty" text="Open-weights models run locally via vLLM/Ollama — patient health data never leaves the facility or country" />
          <ContextCard title="Informal Complaints" text="Localized NLU maps non-standardized or translated chief complaints into defensible, cited urgency flags" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ConfigRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className={`font-mono text-xs ${highlight ? 'text-emerald-600 font-semibold' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}

function ContextCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-xs font-semibold text-gray-800 mb-1">{title}</p>
      <p className="text-[11px] text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

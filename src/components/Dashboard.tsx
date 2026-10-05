import { PRIORITY_CONFIG } from '../data/syntheticPatients';
import { Patient } from '../types';
import { Activity, Users, AlertTriangle, Clock, CheckCircle, Shield } from 'lucide-react';

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
    blue: patients.filter(p => p.priorityLevel === 'blue').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="Patients in Queue" value={patients.length} color="emerald" />
        <StatCard icon={<CheckCircle size={20} />} label="Approved by Nurse" value={approved} color="blue" />
        <StatCard icon={<Clock size={20} />} label="Avg Wait (min)" value={avgWait} color="amber" />
        <StatCard icon={<AlertTriangle size={20} />} label="Deterioration Flags" value={deterioration} color="red" />
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Shield size={16} className="text-emerald-600" />
          Priority Distribution (SATS Scale)
        </h3>
        <div className="space-y-3">
          {(['red', 'orange', 'yellow', 'green', 'blue'] as const).map(level => {
            const config = PRIORITY_CONFIG[level];
            const count = priorityCounts[level];
            const pct = patients.length > 0 ? (count / patients.length) * 100 : 0;
            return (
              <div key={level} className="flex items-center gap-3">
                <span className={`text-xs font-medium w-28 ${config.color}`}>{config.label.split('—')[0].trim()}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      level === 'red' ? 'bg-red-500' :
                      level === 'orange' ? 'bg-orange-500' :
                      level === 'yellow' ? 'bg-yellow-500' :
                      level === 'green' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-gray-600 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Pending Approval */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Approval */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-amber-600" />
            Awaiting Nurse Approval
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
                      Agent scored — awaiting confirmation
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">All priorities approved ✓</p>
          )}
        </div>

        {/* Agent Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Shield size={16} className="text-emerald-600" />
            Agent Configuration
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Orchestration</span>
              <span className="font-mono text-gray-900">LangGraph</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Open-weights model</span>
              <span className="font-mono text-gray-900">Qwen2.5-72B</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Triage Scale</span>
              <span className="font-mono text-gray-900">SATS (South African Triage Scale)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Custom MCP tools</span>
              <span className="font-mono text-gray-900">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Community MCP</span>
              <span className="font-mono text-gray-900">hospital-records-mcp</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Human-in-loop gate</span>
              <span className="text-emerald-600 font-medium">Active ✓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data residency</span>
              <span className="font-mono text-gray-900">On-premise / in-country</span>
            </div>
          </div>
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

import { Patient } from '../types';
import { PRIORITY_CONFIG } from '../data/syntheticPatients';
import { AlertTriangle, TrendingUp, Eye, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface DeteriorationWatchProps {
  patients: Patient[];
}

export default function DeteriorationWatch({ patients }: DeteriorationWatchProps) {
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const deteriorating = patients.filter(p => p.deteriorationFlag);

  const handleAcknowledge = (id: string) => {
    setAcknowledged(prev => new Set([...prev, id]));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Deterioration Watch</h2>
        <p className="text-sm text-gray-500">
          The agent monitors patients in the queue for worsening vitals. A flag triggers a re-check request — not a verdict.
        </p>
      </div>

      {/* Alert Banner */}
      {deteriorating.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-800">
              {deteriorating.length} patient{deteriorating.length > 1 ? 's' : ''} flagged for re-assessment
            </h3>
            <p className="text-xs text-red-600 mt-1">
              Agent detected vitals trending worse since initial assessment. Nurse review required.
            </p>
          </div>
        </div>
      )}

      {/* Deteriorating Patients */}
      <div className="space-y-3">
        {deteriorating.map(patient => {
          const config = PRIORITY_CONFIG[patient.priorityLevel!];
          const isAcked = acknowledged.has(patient.id);
          return (
            <div key={patient.id} className={`bg-white rounded-xl border border-red-200 p-5 shadow-sm ${isAcked ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{patient.name}</h3>
                    <span className="text-xs text-gray-400">{patient.id}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{patient.age}y {patient.gender} · Arrived {formatTimeAgo(patient.arrivalTime)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                  Current: {config.label.split('—')[0].trim()}
                </span>
              </div>

              <div className="bg-red-50 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} className="text-red-600" />
                  <span className="text-xs font-semibold text-red-700">CHANGE DETECTED</span>
                </div>
                <p className="text-sm text-red-800">{patient.deteriorationReason}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <span className="text-[10px] text-gray-400 block">Initial BP</span>
                  <span className="text-xs font-mono text-gray-700">165/100</span>
                </div>
                <div className="bg-red-50 rounded-lg p-2 text-center border border-red-200">
                  <span className="text-[10px] text-red-400 block">Current BP</span>
                  <span className="text-xs font-mono text-red-700 font-bold">{patient.vitals.systolicBP}/{patient.vitals.diastolicBP}</span>
                </div>
                <div className="bg-amber-50 rounded-lg p-2 text-center border border-amber-200">
                  <span className="text-[10px] text-amber-500 block">Agent Suggests</span>
                  <span className="text-xs font-mono text-amber-700 font-bold">Re-check NOW</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[11px] text-gray-400">
                  <Eye size={10} className="inline mr-1" />
                  Agent tool: check_deterioration_markers · Triggered at {formatTimeAgo(new Date(Date.now() - 2 * 60000))}
                </div>
                {isAcked ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle size={12} /> Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(patient.id)}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Acknowledge & Re-assess
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Monitoring Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Monitoring Status</h3>
        <div className="space-y-2">
          {patients.filter(p => !p.deteriorationFlag && p.priorityLevel).map(patient => (
            <div key={patient.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-700">{patient.name}</span>
              </div>
              <span className="text-xs text-emerald-600">Stable — no change detected</span>
            </div>
          ))}
        </div>
      </div>

      {deteriorating.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
          <p>No deterioration flags active</p>
          <p className="text-xs mt-1">Agent is monitoring all patients in queue</p>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

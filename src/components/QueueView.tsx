import { Patient } from '../types';
import { PRIORITY_CONFIG } from '../data/syntheticPatients';
import { Clock, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

interface QueueViewProps {
  patients: Patient[];
}

const priorityOrder = { red: 0, orange: 1, yellow: 2, green: 3, blue: 4 };

export default function QueueView({ patients }: QueueViewProps) {
  const sorted = [...patients]
    .filter(p => p.priorityLevel)
    .sort((a, b) => {
      const aOrder = priorityOrder[a.priorityLevel!];
      const bOrder = priorityOrder[b.priorityLevel!];
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.arrivalTime.getTime() - b.arrivalTime.getTime();
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Triage Queue</h2>
          <p className="text-sm text-gray-500">Patients ordered by SATS priority level, then by arrival time</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          Agent scored · Nurse confirmed
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((patient, index) => {
          const config = PRIORITY_CONFIG[patient.priorityLevel!];
          return (
            <div
              key={patient.id}
              className={`bg-white rounded-xl border-l-4 border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow ${
                patient.deteriorationFlag ? 'ring-2 ring-red-300 ring-offset-2' : ''
              }`}
              style={{ borderLeftColor: patient.priorityLevel === 'red' ? '#ef4444' : patient.priorityLevel === 'orange' ? '#f97316' : patient.priorityLevel === 'yellow' ? '#eab308' : patient.priorityLevel === 'green' ? '#22c55e' : '#3b82f6' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{patient.name}</h3>
                      <span className="text-xs text-gray-400">{patient.age}y {patient.gender}</span>
                      {patient.deteriorationFlag && (
                        <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                          <AlertTriangle size={10} /> Deteriorating
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{patient.complaint.primary}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${config.bgColor} ${config.color}`}>
                        {config.label.split('—')[0].trim()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {patient.waitTimeMinutes} min wait
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={10} /> {patient.department}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {patient.approved ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle size={12} /> Confirmed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {patient.approvedBy} · {patient.approvedAt ? formatTime(patient.approvedAt) : ''}
                  </p>
                </div>
              </div>

              {/* Vitals strip */}
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-6 gap-2">
                <VitalBadge label="BP" value={`${patient.vitals.systolicBP}/${patient.vitals.diastolicBP}`} abnormal={patient.vitals.systolicBP > 180 || patient.vitals.systolicBP < 90} />
                <VitalBadge label="HR" value={`${patient.vitals.pulse}`} abnormal={patient.vitals.pulse > 120 || patient.vitals.pulse < 50} />
                <VitalBadge label="Temp" value={`${patient.vitals.temperature}°C`} abnormal={patient.vitals.temperature > 38.5 || patient.vitals.temperature < 35} />
                <VitalBadge label="RR" value={`${patient.vitals.respiratoryRate}`} abnormal={patient.vitals.respiratoryRate > 24 || patient.vitals.respiratoryRate < 10} />
                <VitalBadge label="SpO₂" value={`${patient.vitals.oxygenSaturation}%`} abnormal={patient.vitals.oxygenSaturation < 94} />
                <VitalBadge label="AVPU" value={patient.vitals.consciousnessLevel} abnormal={patient.vitals.consciousnessLevel !== 'A'} />
              </div>

              {/* Source citation */}
              <div className="mt-2 text-[11px] text-gray-400 italic">
                Source: {patient.prioritySource}
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          <p>No patients in queue</p>
        </div>
      )}
    </div>
  );
}

function VitalBadge({ label, value, abnormal }: { label: string; value: string; abnormal: boolean }) {
  return (
    <div className={`text-center px-2 py-1 rounded ${abnormal ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
      <span className="text-[10px] text-gray-400 block">{label}</span>
      <span className={`text-xs font-mono font-medium ${abnormal ? 'text-red-600' : 'text-gray-700'}`}>{value}</span>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

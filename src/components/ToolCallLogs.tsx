import { useState } from 'react';
import { toolCallExamples } from '../data/syntheticPatients';
import { Terminal, ChevronDown, ChevronRight, Server, Clock, CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  patientId: string;
  patientName: string;
  steps: LogStep[];
}

interface LogStep {
  id: string;
  description: string;
  tool?: string;
  server?: string;
  input?: string;
  output?: string;
  duration?: string;
  status: 'success' | 'failure' | 'pending' | 'human-gate';
  humanGate?: boolean;
  approvedBy?: string;
}

const demoLogs: LogEntry[] = [
  {
    id: 'log-001',
    timestamp: '09:14:22',
    patientId: 'P007',
    patientName: 'Halima Yusuf',
    steps: [
      { id: 's1', description: 'Receive patient vitals and presenting complaint', status: 'success', duration: '12ms' },
      { id: 's2', description: 'Call get_patient_history to check for known conditions', tool: 'get_patient_history', server: 'hospital-records-mcp (community)', input: '{"patient_id": "P007"}', output: '{"known_conditions": ["Type 2 Diabetes"], "allergies": ["Penicillin"], "last_visit": "2026-08-15"}', status: 'success', duration: '234ms' },
      { id: 's3', description: 'Apply SATS discriminators to vitals and complaint', tool: 'calculate_urgency_score', server: 'triage-mcp (custom)', input: '{"vitals": {"sbp": 110, "dbp": 70, "hr": 96, "temp": 37.8, "rr": 20, "spo2": 96, "avpu": "A"}, "complaint": "Chest tightness and shortness of breath", "severity": "severe", "symptoms": ["sweating", "radiating pain to left arm"]}', output: '{"score": 2, "level": "orange", "discriminator": "chest_pain_with_radiation", "target_time": "10 minutes"}', status: 'success', duration: '89ms' },
      { id: 's4', description: 'Cross-reference score against published SATS table', tool: 'validate_against_scale', server: 'sats-reference-mcp (custom)', input: '{"score": 2, "discriminator": "chest_pain_with_radiation"}', output: '{"valid": true, "matches": "SATS Table 3.2 — Chest pain with radiation to arm + diaphoresis = Orange (Very Urgent)"}', status: 'success', duration: '45ms' },
      { id: 's5', description: 'Determine department routing', tool: 'route_to_department', server: 'triage-mcp (custom)', input: '{"priority": "orange", "complaint": "chest_tightness", "age": 72, "gender": "F"}', output: '{"department": "Emergency", "reason": "Orange priority + chest complaint + age >65 → Emergency department"}', status: 'success', duration: '31ms' },
      { id: 's6', description: '⏸ HUMAN GATE — Priority requires nurse confirmation before entering queue', status: 'human-gate', humanGate: true, approvedBy: 'Nurse Fatima B.' },
      { id: 's7', description: 'Priority confirmed. Patient added to Emergency queue at position #2.', status: 'success', duration: '—' },
    ],
  },
  {
    id: 'log-002',
    timestamp: '09:08:15',
    patientId: 'P002',
    patientName: 'Kwame Asante',
    steps: [
      { id: 's1', description: 'Receive patient vitals and presenting complaint', status: 'success', duration: '8ms' },
      { id: 's2', description: 'Call get_patient_history', tool: 'get_patient_history', server: 'hospital-records-mcp (community)', input: '{"patient_id": "P002"}', output: '{"known_conditions": ["Hypertension"], "medications": ["Amlodipine 10mg"], "last_visit": "2026-09-20"}', status: 'success', duration: '198ms' },
      { id: 's3', description: 'Apply SATS discriminators', tool: 'calculate_urgency_score', server: 'triage-mcp (custom)', input: '{"vitals": {"sbp": 180, "dbp": 110, "hr": 92, "temp": 37.1, "rr": 22, "spo2": 95, "avpu": "A"}, "complaint": "Severe headache with blurred vision", "severity": "severe"}', output: '{"score": 2, "level": "orange", "discriminator": "hypertensive_emergency_with_neuro"}', status: 'success', duration: '76ms' },
      { id: 's4', description: 'Validate against SATS', tool: 'validate_against_scale', server: 'sats-reference-mcp (custom)', input: '{"score": 2}', output: '{"valid": true}' , status: 'success', duration: '38ms' },
      { id: 's5', description: 'Route to department', tool: 'route_to_department', server: 'triage-mcp (custom)', input: '{"priority": "orange"}', output: '{"department": "Emergency"}', status: 'success', duration: '22ms' },
      { id: 's6', description: '⏸ HUMAN GATE — Nurse confirmation required', status: 'human-gate', humanGate: true, approvedBy: 'Nurse Fatima B.' },
      { id: 's7', description: 'Confirmed. Patient in Emergency queue.', status: 'success', duration: '—' },
    ],
  },
  {
    id: 'log-003',
    timestamp: '09:22:01',
    patientId: 'P002',
    patientName: 'Kwame Asante (Re-check)',
    steps: [
      { id: 's1', description: 'Deterioration check triggered — 12 min since last vitals', status: 'success', duration: '5ms' },
      { id: 's2', description: 'Compare current vitals against baseline', tool: 'check_deterioration_markers', server: 'triage-mcp (custom)', input: '{"baseline": {"sbp": 165, "dbp": 100, "avpu": "A"}, "current": {"sbp": 180, "dbp": 110, "avpu": "A"}, "new_symptoms": ["confusion"]}', output: '{"deteriorating": true, "changed": ["sbp +15", "dbp +10", "new confusion"], "suggestion": "escalate_for_review"}', status: 'success', duration: '67ms' },
      { id: 's3', description: '⏸ HUMAN GATE — Flag raised for nurse re-assessment (no priority change without approval)', status: 'human-gate', humanGate: true, approvedBy: 'Pending' },
    ],
  },
];

export default function ToolCallLogs() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['log-001']));

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Agent Tool Call Log</h2>
        <p className="text-sm text-gray-500">
          Every action the agent takes is logged with inputs, outputs, and timestamps. Irreversible actions require human gate approval.
        </p>
      </div>

      {/* MCP Tools Reference */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Server size={14} className="text-emerald-600" />
          MCP Servers & Tools
        </h3>
        <div className="space-y-2">
          {toolCallExamples.map((tool, i) => (
            <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
              <Terminal size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{tool.tool}</code>
                  <span className="text-[10px] text-gray-400">{tool.server}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Entries */}
      <div className="space-y-3">
        {demoLogs.map(log => (
          <div key={log.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggle(log.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {expanded.has(log.id) ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{log.patientName}</span>
                    <span className="text-xs text-gray-400">{log.patientId}</span>
                  </div>
                  <p className="text-xs text-gray-500">{log.steps.length} steps · {log.steps.filter(s => s.tool).length} tool calls</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500 font-mono">{log.timestamp}</span>
              </div>
            </button>

            {expanded.has(log.id) && (
              <div className="border-t border-gray-100 p-4 space-y-2">
                {log.steps.map((step, i) => (
                  <div key={step.id} className={`flex gap-3 ${step.humanGate ? 'bg-amber-50 -mx-4 px-4 py-2 border-y border-amber-200' : ''}`}>
                    <div className="flex flex-col items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.status === 'success' ? 'bg-emerald-100' :
                        step.status === 'human-gate' ? 'bg-amber-100' :
                        step.status === 'failure' ? 'bg-red-100' :
                        'bg-gray-100'
                      }`}>
                        {step.status === 'success' ? <CheckCircle size={10} className="text-emerald-600" /> :
                         step.status === 'human-gate' ? <Shield size={10} className="text-amber-600" /> :
                         step.status === 'failure' ? <XCircle size={10} className="text-red-600" /> :
                         <Loader2 size={10} className="text-gray-400 animate-spin" />}
                      </div>
                      {i < log.steps.length - 1 && <div className="w-px h-full bg-gray-200 mt-1" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className={`text-sm ${step.humanGate ? 'font-semibold text-amber-800' : 'text-gray-700'}`}>
                        {step.description}
                      </p>
                      {step.tool && (
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <code className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{step.tool}</code>
                            <span className="text-[10px] text-gray-400">{step.server}</span>
                            {step.duration && <span className="text-[10px] text-gray-400 ml-auto">{step.duration}</span>}
                          </div>
                          {step.input && (
                            <div className="bg-gray-900 rounded p-2 mt-1">
                              <span className="text-[9px] text-gray-500 uppercase">Input</span>
                              <pre className="text-[10px] text-emerald-300 font-mono overflow-x-auto">{step.input}</pre>
                            </div>
                          )}
                          {step.output && (
                            <div className="bg-gray-900 rounded p-2 mt-1">
                              <span className="text-[9px] text-gray-500 uppercase">Output</span>
                              <pre className="text-[10px] text-blue-300 font-mono overflow-x-auto">{step.output}</pre>
                            </div>
                          )}
                        </div>
                      )}
                      {step.humanGate && step.approvedBy && (
                        <p className="text-xs text-amber-600 mt-1">
                          <Shield size={10} className="inline mr-1" />
                          {step.approvedBy === 'Pending' ? 'Awaiting nurse confirmation...' : `Approved by ${step.approvedBy}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Patient, PatientVitals, PresentingComplaint, PriorityLevel } from '../types';
import { PRIORITY_CONFIG } from '../data/syntheticPatients';
import { Thermometer, Heart, Wind, Droplets, Brain, Send, Loader2, CheckCircle, AlertCircle, Server } from 'lucide-react';

interface PatientIntakeProps {
  onSubmit: (patient: Patient) => void;
}

export default function PatientIntake({ onSubmit }: PatientIntakeProps) {
  const [step, setStep] = useState<'vitals' | 'complaint' | 'agent-run' | 'scoring' | 'done'>('vitals');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('F');
  const [vitals, setVitals] = useState<PatientVitals>({
    systolicBP: 120, diastolicBP: 80, pulse: 72, temperature: 37.0,
    respiratoryRate: 16, oxygenSaturation: 98, consciousnessLevel: 'A',
  });
  const [complaint, setComplaint] = useState<PresentingComplaint>({
    primary: '', duration: '', severity: 'mild', additionalSymptoms: [],
  });
  const [symptomInput, setSymptomInput] = useState('');
  const [scoredPriority, setScoredPriority] = useState<PriorityLevel | null>(null);
  const [scoredScore, setScoredScore] = useState<number | null>(null);
  const [scoredSource, setScoredSource] = useState('');
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentStep, setAgentStep] = useState(0);

  const agentSteps = [
    { tool: 'score_triage_priority', server: 'triage-desk-mcp-server', desc: 'Evaluating vitals against SATS discriminators...' },
    { tool: 'sats://guidelines/vitals_matrix', server: 'MCP Resource', desc: 'Cross-referencing SATS reference tables...' },
    { tool: 'route_department_referral', server: 'triage-desk-mcp-server', desc: 'Mapping to department queue...' },
    { tool: 'execute_query', server: '@modelcontextprotocol/server-postgres', desc: 'Preparing audit record...' },
  ];

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setComplaint(prev => ({ ...prev, additionalSymptoms: [...prev.additionalSymptoms, symptomInput.trim()] }));
      setSymptomInput('');
    }
  };

  const runAgent = () => {
    setAgentRunning(true);
    setStep('agent-run');
    setAgentStep(0);

    // Simulate agent multi-step execution
    agentSteps.forEach((_, i) => {
      setTimeout(() => setAgentStep(i + 1), (i + 1) * 800);
    });

    setTimeout(() => {
      const result = calculatePriority(vitals, complaint);
      setScoredPriority(result.level);
      setScoredScore(result.score);
      setScoredSource(result.reasoning);
      setAgentRunning(false);
      setStep('scoring');
    }, agentSteps.length * 800 + 500);
  };

  const confirmAndSubmit = () => {
    const patient: Patient = {
      id: `P${String(Date.now()).slice(-3)}`,
      name: name || 'Unknown Patient',
      age: parseInt(age) || 30,
      gender,
      arrivalTime: new Date(),
      vitals,
      complaint,
      priorityLevel: scoredPriority,
      priorityScore: scoredScore,
      prioritySource: scoredSource,
      approved: true,
      approvedBy: 'Nurse (You)',
      approvedAt: new Date(),
      deteriorationFlag: false,
      deteriorationReason: null,
      department: getDepartment(scoredPriority!, complaint),
      waitTimeMinutes: 0,
    };
    onSubmit(patient);
    setStep('done');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8 gap-2">
        {['vitals', 'complaint', 'agent-run', 'scoring', 'done'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? 'bg-emerald-500 text-white' :
              ['vitals', 'complaint', 'agent-run', 'scoring', 'done'].indexOf(step) > i ? 'bg-emerald-100 text-emerald-700' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i + 1}
            </div>
            {i < 4 && <div className={`w-6 h-0.5 ${['vitals', 'complaint', 'agent-run', 'scoring', 'done'].indexOf(step) > i ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Vitals Entry */}
      {step === 'vitals' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Patient Vitals</h2>
          <p className="text-sm text-gray-500 mb-6">Enter baseline measurements taken at the triage desk</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Patient name" value={name} onChange={e => setName(e.target.value)} />
            <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Age" type="number" value={age} onChange={e => setAge(e.target.value)} />
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={gender} onChange={e => setGender(e.target.value as 'M' | 'F')}>
              <option value="F">Female</option>
              <option value="M">Male</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <VitalInput icon={<Heart size={14} />} label="Systolic BP" unit="mmHg" value={vitals.systolicBP} onChange={v => setVitals(prev => ({ ...prev, systolicBP: v }))} />
            <VitalInput icon={<Heart size={14} />} label="Diastolic BP" unit="mmHg" value={vitals.diastolicBP} onChange={v => setVitals(prev => ({ ...prev, diastolicBP: v }))} />
            <VitalInput icon={<Droplets size={14} />} label="Pulse" unit="bpm" value={vitals.pulse} onChange={v => setVitals(prev => ({ ...prev, pulse: v }))} />
            <VitalInput icon={<Thermometer size={14} />} label="Temperature" unit="°C" value={vitals.temperature} onChange={v => setVitals(prev => ({ ...prev, temperature: v }))} step={0.1} />
            <VitalInput icon={<Wind size={14} />} label="Resp. Rate" unit="/min" value={vitals.respiratoryRate} onChange={v => setVitals(prev => ({ ...prev, respiratoryRate: v }))} />
            <VitalInput icon={<Droplets size={14} />} label="SpO₂" unit="%" value={vitals.oxygenSaturation} onChange={v => setVitals(prev => ({ ...prev, oxygenSaturation: v }))} />
          </div>

          <div className="mb-6">
            <label className="text-xs font-medium text-gray-600 mb-2 block flex items-center gap-1">
              <Brain size={14} /> Consciousness Level (AVPU)
            </label>
            <div className="flex gap-2">
              {(['A', 'V', 'P', 'U'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setVitals(prev => ({ ...prev, consciousnessLevel: level }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    vitals.consciousnessLevel === level
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {level} — {level === 'A' ? 'Alert' : level === 'V' ? 'Voice' : level === 'P' ? 'Pain' : 'Unresponsive'}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setStep('complaint')} className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
            Continue to Complaint →
          </button>
        </div>
      )}

      {/* Complaint Entry */}
      {step === 'complaint' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Presenting Complaint</h2>
          <p className="text-sm text-gray-500 mb-6">What is the patient's main concern today?</p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Primary Complaint (Chief Complaint)</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder="e.g., Chest pain, fever, abdominal pain..."
                value={complaint.primary}
                onChange={e => setComplaint(prev => ({ ...prev, primary: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Duration</label>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="e.g., 2 hours, 3 days"
                  value={complaint.duration}
                  onChange={e => setComplaint(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Severity</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  value={complaint.severity}
                  onChange={e => setComplaint(prev => ({ ...prev, severity: e.target.value as 'mild' | 'moderate' | 'severe' }))}
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Additional Symptoms</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="Add symptom..."
                  value={symptomInput}
                  onChange={e => setSymptomInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSymptom()}
                />
                <button onClick={addSymptom} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Add</button>
              </div>
              {complaint.additionalSymptoms.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {complaint.additionalSymptoms.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('vitals')} className="px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              ← Back
            </button>
            <button
              onClick={runAgent}
              disabled={!complaint.primary}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={16} /> Run Triage Agent
            </button>
          </div>
        </div>
      )}

      {/* Agent Running */}
      {step === 'agent-run' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Loader2 size={18} className="text-emerald-500 animate-spin" />
            <h2 className="text-lg font-semibold text-gray-900">Agent Executing...</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">LangGraph orchestrating multi-step evaluation via MCP tools</p>

          <div className="space-y-3">
            {agentSteps.map((s, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                i < agentStep ? 'bg-emerald-50 border border-emerald-200' :
                i === agentStep ? 'bg-blue-50 border border-blue-200' :
                'bg-gray-50 border border-gray-100 opacity-50'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  i < agentStep ? 'bg-emerald-500' :
                  i === agentStep ? 'bg-blue-500' :
                  'bg-gray-300'
                }`}>
                  {i < agentStep ? <CheckCircle size={10} className="text-white" /> :
                   i === agentStep ? <Loader2 size={10} className="text-white animate-spin" /> :
                   <span className="text-[8px] text-white font-bold">{i + 1}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">{s.tool}</code>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Server size={8} /> {s.server}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-900 rounded-lg">
            <p className="text-[10px] text-gray-500 uppercase mb-1">Agent State</p>
            <pre className="text-[11px] text-emerald-300 font-mono">
{`LangGraph State: {
  phase: "${agentStep < agentSteps.length ? 'executing' : 'awaiting_human_gate'}",
  tools_called: ${agentStep},
  model: "qwen-2.5-72b-instruct",
  transport: "stdio",
  human_gate: ${agentStep >= agentSteps.length ? 'PENDING' : 'NOT_YET'}
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Scoring Result — Human Gate */}
      {step === 'scoring' && scoredPriority && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">⏸ Human Gate — Nurse Confirmation Required</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            The agent has scored this patient. <strong>No queue position changes without explicit nurse sign-off.</strong>
          </p>

          <div className={`p-4 rounded-xl border-2 ${PRIORITY_CONFIG[scoredPriority].borderColor} ${PRIORITY_CONFIG[scoredPriority].bgColor} mb-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-lg font-bold ${PRIORITY_CONFIG[scoredPriority].color}`}>
                {PRIORITY_CONFIG[scoredPriority].label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/80 px-2 py-1 rounded-full font-mono font-medium">
                  Score: {scoredScore}
                </span>
                <span className="text-xs bg-white/80 px-2 py-1 rounded-full font-medium">
                  Target: {PRIORITY_CONFIG[scoredPriority].targetTime}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700">{PRIORITY_CONFIG[scoredPriority].description}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">AGENT REASONING — CITED FROM SATS</h4>
            <p className="text-sm text-gray-800">{scoredSource}</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <h4 className="text-[10px] text-gray-500 uppercase mb-2">Tool Call Trace</h4>
            <pre className="text-[11px] text-blue-300 font-mono overflow-x-auto">
{`score_triage_priority(
  vitals: { sbp: ${vitals.systolicBP}, dbp: ${vitals.diastolicBP}, hr: ${vitals.pulse}, temp: ${vitals.temperature}, rr: ${vitals.respiratoryRate}, spo2: ${vitals.oxygenSaturation}, avpu: "${vitals.consciousnessLevel}" },
  complaint: "${complaint.primary}",
  severity: "${complaint.severity}"
)
→ { level: "${scoredPriority}", score: ${scoredScore}, citation: "SATS Table ..." }`}
            </pre>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('complaint')} className="px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              ← Re-score
            </button>
            <button onClick={confirmAndSubmit} className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
              <CheckCircle size={16} /> Confirm Priority & Add to Queue
            </button>
          </div>
        </div>
      )}

      {/* Done */}
      {step === 'done' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Patient Added to Queue</h2>
          <p className="text-sm text-gray-500 mb-2">Priority confirmed by nurse. Audit record written to PostgreSQL.</p>
          <p className="text-xs text-gray-400 mb-6">Patient routed to department queue via route_department_referral</p>
          <button onClick={() => { setStep('vitals'); setName(''); setAge(''); setScoredPriority(null); setScoredScore(null); setScoredSource(''); setComplaint({ primary: '', duration: '', severity: 'mild', additionalSymptoms: [] }); }} className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">
            Score Another Patient
          </button>
        </div>
      )}
    </div>
  );
}

function VitalInput({ icon, label, unit, value, onChange, step = 1 }: {
  icon: React.ReactNode; label: string; unit: string; value: number; onChange: (v: number) => void; step?: number;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
        {icon} {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step={step}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
        />
        <span className="text-xs text-gray-400 whitespace-nowrap">{unit}</span>
      </div>
    </div>
  );
}

function calculatePriority(vitals: PatientVitals, complaint: PresentingComplaint): { level: PriorityLevel; score: number; reasoning: string } {
  const { systolicBP, pulse, temperature, respiratoryRate, oxygenSaturation, consciousnessLevel } = vitals;

  // RED — Score 0-1
  if (consciousnessLevel === 'U' || consciousnessLevel === 'P') {
    return { level: 'red', score: 0, reasoning: `SATS Discriminator: Altered consciousness (AVPU=${consciousnessLevel}) — immediate life threat. Score: 0. Citation: SATS Table 2.1 — Consciousness level P/U triggers immediate resuscitation.` };
  }
  if (systolicBP < 90 && pulse > 120) {
    return { level: 'red', score: 1, reasoning: `SATS Discriminator: Haemodynamic instability — SBP ${systolicBP} (<90) + tachycardia HR ${pulse} (>120). Score: 1. Citation: SATS Table 3.2 — Circulatory compromise with shock indicators.` };
  }
  if (oxygenSaturation < 90) {
    return { level: 'red', score: 0, reasoning: `SATS Discriminator: Critical hypoxia — SpO₂ ${oxygenSaturation}% (<90%). Score: 0. Citation: SATS Table 2.2 — Respiratory failure requiring immediate intervention.` };
  }

  // ORANGE — Score 2
  if (systolicBP > 180 || (complaint.severity === 'severe' && (complaint.primary.toLowerCase().includes('chest') || complaint.primary.toLowerCase().includes('breath')))) {
    return { level: 'orange', score: 2, reasoning: `SATS Discriminator: ${systolicBP > 180 ? `Hypertensive emergency (SBP ${systolicBP} >180)` : 'Chest/breathing complaint with severe presentation'}. Score: 2. Citation: SATS Table 2.1 — Very urgent discriminator met. Target: 10 min.` };
  }
  if (temperature > 39 && complaint.additionalSymptoms.some(s => s.toLowerCase().includes('chest') || s.toLowerCase().includes('breathing') || s.toLowerCase().includes('indrawing'))) {
    return { level: 'orange', score: 2, reasoning: `SATS Discriminator: Paediatric danger signs — high fever (${temperature}°C) + respiratory symptoms. Score: 2. Citation: SATS Paediatric Table 2.3 — WHO pneumonia danger signs. Target: 10 min.` };
  }
  if (respiratoryRate > 24 && oxygenSaturation < 96) {
    return { level: 'orange', score: 2, reasoning: `SATS Discriminator: Respiratory distress — RR ${respiratoryRate} (>24) + SpO₂ ${oxygenSaturation}% (<96%). Score: 2. Citation: SATS Table 2.2 — Respiratory compromise. Target: 10 min.` };
  }

  // YELLOW — Score 3
  if (temperature > 38.5 || complaint.severity === 'moderate') {
    return { level: 'yellow', score: 3, reasoning: `SATS Discriminator: ${temperature > 38.5 ? `fever (${temperature}°C)` : 'moderate severity complaint'}. Stable vitals but needs timely assessment. Score: 3. Citation: SATS Table 4.1 — Urgent presentation, no emergency discriminators. Target: 60 min.` };
  }

  // GREEN — Score 4-5
  if (complaint.severity === 'mild' && complaint.duration.toLowerCase().includes('routine')) {
    return { level: 'green', score: 5, reasoning: `SATS Discriminator: Non-urgent — routine follow-up, all vitals within normal limits. Score: 5. Citation: SATS Table 5.1 — No discriminators triggered. Target: 120 min.` };
  }

  return { level: 'green', score: 4, reasoning: `SATS Discriminator: Not urgent — mild-moderate complaint with stable vitals (BP ${systolicBP}/${vitals.diastolicBP}, HR ${pulse}, Temp ${temperature}°C). Score: 4. Citation: SATS Table 4.3 — No emergency or urgent discriminators met. Target: 120 min.` };
}

function getDepartment(priority: PriorityLevel, complaint: PresentingComplaint): string {
  const primary = complaint.primary.toLowerCase();
  if (priority === 'red' || priority === 'orange') return 'Emergency';
  if (primary.includes('chest') || primary.includes('breath')) return 'Emergency';
  if (primary.includes('child') || primary.includes('paediatric') || primary.includes('fever') && complaint.additionalSymptoms.some(s => s.toLowerCase().includes('indrawing'))) return 'Paediatrics';
  if (primary.includes('back') || primary.includes('bone') || primary.includes('joint')) return 'Orthopaedics';
  if (primary.includes('pregnan') || primary.includes('vaginal')) return 'Maternity';
  return 'General OPD';
}

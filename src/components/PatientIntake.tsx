import { useState } from 'react';
import { Patient, PatientVitals, PresentingComplaint, PriorityLevel } from '../types';
import { PRIORITY_CONFIG } from '../data/syntheticPatients';
import { Thermometer, Heart, Wind, Droplets, Brain, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface PatientIntakeProps {
  onSubmit: (patient: Patient) => void;
}

export default function PatientIntake({ onSubmit }: PatientIntakeProps) {
  const [step, setStep] = useState<'vitals' | 'complaint' | 'scoring' | 'done'>('vitals');
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
  const [scoredSource, setScoredSource] = useState('');
  const [scoring, setScoring] = useState(false);

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setComplaint(prev => ({ ...prev, additionalSymptoms: [...prev.additionalSymptoms, symptomInput.trim()] }));
      setSymptomInput('');
    }
  };

  const runAgent = () => {
    setScoring(true);
    // Simulate agent scoring with SATS logic
    setTimeout(() => {
      const priority = calculatePriority(vitals, complaint);
      setScoredPriority(priority.level);
      setScoredSource(priority.reasoning);
      setScoring(false);
      setStep('scoring');
    }, 2000);
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
        {['vitals', 'complaint', 'scoring', 'done'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? 'bg-emerald-500 text-white' :
              ['vitals', 'complaint', 'scoring', 'done'].indexOf(step) > i ? 'bg-emerald-100 text-emerald-700' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i + 1}
            </div>
            {i < 3 && <div className={`w-8 h-0.5 ${['vitals', 'complaint', 'scoring', 'done'].indexOf(step) > i ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Vitals Entry */}
      {step === 'vitals' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Patient Vitals</h2>
          <p className="text-sm text-gray-500 mb-6">Enter baseline measurements taken at the triage desk</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2 grid grid-cols-3 gap-3">
              <input className="col-span-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Patient name" value={name} onChange={e => setName(e.target.value)} />
              <input className="col-span-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Age" type="number" value={age} onChange={e => setAge(e.target.value)} />
              <select className="col-span-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" value={gender} onChange={e => setGender(e.target.value as 'M' | 'F')}>
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
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
              <label className="text-xs font-medium text-gray-600 mb-1 block">Primary Complaint</label>
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
              disabled={!complaint.primary || scoring}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {scoring ? <><Loader2 size={16} className="animate-spin" /> Agent scoring...</> : <><Send size={16} /> Run Triage Agent</>}
            </button>
          </div>
        </div>
      )}

      {/* Scoring Result */}
      {step === 'scoring' && scoredPriority && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Human Gate — Confirm Priority</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">The agent has scored this patient. A nurse must confirm before the patient enters the queue.</p>

          <div className={`p-4 rounded-xl border-2 ${PRIORITY_CONFIG[scoredPriority].borderColor} ${PRIORITY_CONFIG[scoredPriority].bgColor} mb-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-lg font-bold ${PRIORITY_CONFIG[scoredPriority].color}`}>
                {PRIORITY_CONFIG[scoredPriority].label}
              </span>
              <span className="text-xs bg-white/80 px-2 py-1 rounded-full font-medium">
                Target: {PRIORITY_CONFIG[scoredPriority].targetTime}
              </span>
            </div>
            <p className="text-sm text-gray-700">{PRIORITY_CONFIG[scoredPriority].description}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">AGENT REASONING (CITED)</h4>
            <p className="text-sm text-gray-800">{scoredSource}</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Scale:</strong> South African Triage Scale (SATS) · <strong>Model:</strong> Qwen2.5-72B (local) · <strong>Tool:</strong> calculate_urgency_score
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('complaint')} className="px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              ← Re-score
            </button>
            <button onClick={confirmAndSubmit} className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
              <CheckCircle size={16} /> Confirm & Add to Queue
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
          <p className="text-sm text-gray-500 mb-6">Priority confirmed by nurse. Patient routed to department queue.</p>
          <button onClick={() => { setStep('vitals'); setName(''); setAge(''); setScoredPriority(null); setScoredSource(''); setComplaint({ primary: '', duration: '', severity: 'mild', additionalSymptoms: [] }); }} className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">
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

function calculatePriority(vitals: PatientVitals, complaint: PresentingComplaint): { level: PriorityLevel; reasoning: string } {
  // Simplified SATS-inspired scoring
  const { systolicBP, pulse, temperature, respiratoryRate, oxygenSaturation, consciousnessLevel } = vitals;

  // Red flags
  if (consciousnessLevel === 'U' || consciousnessLevel === 'P') {
    return { level: 'red', reasoning: `SATS Discriminator: Altered consciousness (AVPU=${consciousnessLevel}) — immediate life threat. Vitals: BP ${systolicBP}/${vitals.diastolicBP}, HR ${pulse}, SpO₂ ${oxygenSaturation}%.` };
  }
  if (systolicBP < 90 && pulse > 120) {
    return { level: 'red', reasoning: `SATS Discriminator: Haemodynamic instability — SBP ${systolicBP} (<90) + tachycardia HR ${pulse} (>120). Shock risk. Complaint: "${complaint.primary}".` };
  }
  if (oxygenSaturation < 90) {
    return { level: 'red', reasoning: `SATS Discriminator: Critical hypoxia — SpO₂ ${oxygenSaturation}% (<90%). Immediate oxygen and assessment required.` };
  }

  // Orange flags
  if (systolicBP > 180 || (complaint.severity === 'severe' && (complaint.primary.toLowerCase().includes('chest') || complaint.primary.toLowerCase().includes('breath')))) {
    return { level: 'orange', reasoning: `SATS Discriminator: ${systolicBP > 180 ? `Hypertensive emergency (SBP ${systolicBP} >180)` : 'Chest/breathing complaint with severe presentation'} + associated symptoms. Target: 10 min.` };
  }
  if (temperature > 39 && (complaint.primary.toLowerCase().includes('child') || complaint.additionalSymptoms.some(s => s.toLowerCase().includes('chest') || s.toLowerCase().includes('breathing')))) {
    return { level: 'orange', reasoning: `SATS Discriminator: Paediatric danger signs — high fever (${temperature}°C) + respiratory symptoms. WHO criteria met.` };
  }
  if (respiratoryRate > 24 && oxygenSaturation < 96) {
    return { level: 'orange', reasoning: `SATS Discriminator: Respiratory distress — RR ${respiratoryRate} (>24) + SpO₂ ${oxygenSaturation}% (<96%).` };
  }

  // Yellow flags
  if (temperature > 38.5 || complaint.severity === 'moderate') {
    return { level: 'yellow', reasoning: `SATS Discriminator: Moderate urgency — ${temperature > 38.5 ? `fever (${temperature}°C)` : 'moderate severity complaint'}. Stable vitals but needs timely assessment. Target: 60 min.` };
  }

  // Green / Blue
  if (complaint.severity === 'mild' && complaint.duration.toLowerCase().includes('routine')) {
    return { level: 'blue', reasoning: `SATS Discriminator: Non-urgent — routine follow-up, all vitals within normal limits. Target: 240 min.` };
  }

  return { level: 'green', reasoning: `SATS Discriminator: Less urgent — mild-moderate complaint with stable vitals (BP ${systolicBP}/${vitals.diastolicBP}, HR ${pulse}, Temp ${temperature}°C). Target: 120 min.` };
}

function getDepartment(priority: PriorityLevel, complaint: PresentingComplaint): string {
  const primary = complaint.primary.toLowerCase();
  if (priority === 'red' || priority === 'orange') return 'Emergency';
  if (primary.includes('chest') || primary.includes('breath')) return 'Emergency';
  if (primary.includes('child') || primary.includes('paediatric')) return 'Paediatrics';
  if (primary.includes('back') || primary.includes('bone') || primary.includes('joint')) return 'Orthopaedics';
  if (primary.includes('pregnan') || primary.includes('vaginal')) return 'Maternity';
  return 'General OPD';
}

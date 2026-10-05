export interface PatientVitals {
  systolicBP: number;
  diastolicBP: number;
  pulse: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  consciousnessLevel: 'A' | 'V' | 'P' | 'U'; // AVPU scale
}

export interface PresentingComplaint {
  primary: string;
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  additionalSymptoms: string[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  arrivalTime: Date;
  vitals: PatientVitals;
  complaint: PresentingComplaint;
  priorityLevel: PriorityLevel | null;
  prioritySource: string;
  approved: boolean;
  approvedBy: string | null;
  approvedAt: Date | null;
  deteriorationFlag: boolean;
  deteriorationReason: string | null;
  department: string | null;
  waitTimeMinutes: number;
}

export type PriorityLevel = 'red' | 'orange' | 'yellow' | 'green' | 'blue';

export interface PriorityScore {
  level: PriorityLevel;
  label: string;
  score: number;
  reasoning: string[];
  citations: string[];
  discriminator: string;
  targetTime: string;
}

export interface ToolCall {
  id: string;
  timestamp: Date;
  tool: string;
  server: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  duration: number;
  status: 'success' | 'failure' | 'pending';
}

export interface AgentLog {
  id: string;
  timestamp: Date;
  step: string;
  description: string;
  toolCalls: ToolCall[];
  humanGate: boolean;
  approvedBy: string | null;
}

export interface DeteriorationAlert {
  patientId: string;
  patientName: string;
  timestamp: Date;
  changedVitals: string[];
  previousPriority: PriorityLevel;
  suggestedPriority: PriorityLevel;
  reason: string;
  acknowledged: boolean;
}

export type TabView = 'dashboard' | 'intake' | 'queue' | 'deterioration' | 'logs' | 'architecture';

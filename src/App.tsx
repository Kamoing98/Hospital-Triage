import { useState } from 'react';
import { TabView, Patient } from './types';
import { syntheticPatients } from './data/syntheticPatients';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PatientIntake from './components/PatientIntake';
import QueueView from './components/QueueView';
import DeteriorationWatch from './components/DeteriorationWatch';
import ToolCallLogs from './components/ToolCallLogs';
import ArchitecturePage from './components/ArchitecturePage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(syntheticPatients);

  const handleNewPatient = (patient: Patient) => {
    setPatients(prev => [...prev, patient]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && <Dashboard patients={patients} />}
        {activeTab === 'intake' && <PatientIntake onSubmit={handleNewPatient} />}
        {activeTab === 'queue' && <QueueView patients={patients} />}
        {activeTab === 'deterioration' && <DeteriorationWatch patients={patients} />}
        {activeTab === 'logs' && <ToolCallLogs />}
        {activeTab === 'architecture' && <ArchitecturePage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              Triage Desk — Agentic AI for Hospital Triage · Built on MCP + Open Source
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>SATS (South African Triage Scale)</span>
              <span>·</span>
              <span>LangGraph</span>
              <span>·</span>
              <span>Qwen2.5-72B</span>
              <span>·</span>
              <span>Human-in-the-loop</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { TabView } from '../types';
import { Activity, ClipboardList, Users, AlertTriangle, FileText, Layers, Heart } from 'lucide-react';

interface HeaderProps {
  activeTab: TabView;
  setActiveTab: (tab: TabView) => void;
}

const tabs: { id: TabView; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Activity size={16} /> },
  { id: 'intake', label: 'New Patient', icon: <ClipboardList size={16} /> },
  { id: 'queue', label: 'Queue', icon: <Users size={16} /> },
  { id: 'deterioration', label: 'Deterioration', icon: <AlertTriangle size={16} /> },
  { id: 'logs', label: 'Agent Logs', icon: <FileText size={16} /> },
  { id: 'architecture', label: 'Architecture', icon: <Layers size={16} /> },
];

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Heart size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Triage Desk</h1>
              <p className="text-[11px] text-gray-500 -mt-0.5">Agentic AI Priority Scoring</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-gray-500">Agent Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}

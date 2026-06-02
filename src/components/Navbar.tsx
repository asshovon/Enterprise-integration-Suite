import React from 'react';
import { Database, UserCheck, Layers, CloudLightning, HelpCircle, Terminal } from "lucide-react";

interface NavbarProps {
  activeTab: 'inventories' | 'salesforce' | 'odoo' | 'tickets';
  setActiveTab: (tab: 'inventories' | 'salesforce' | 'odoo' | 'tickets') => void;
  openTicketModal: () => void;
}

export default function Navbar({ activeTab, setActiveTab, openTicketModal }: NavbarProps) {
  return (
    <aside className="w-64 bg-slate-950 text-slate-400 flex flex-col shrink-0 border-r border-slate-900 min-h-screen" id="main-nav">
      {/* Brand area */}
      <div className="p-6">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white select-none shadow-md">
            E
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-md text-white">AppIntegrate Pro</span>
            <span className="text-[9px] uppercase font-mono mt-0.5 text-blue-400 font-black tracking-widest leading-none">
              Enterprise Hub
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {/* Inventories */}
          <button
            id="nav-btn-inventories"
            onClick={() => setActiveTab('inventories')}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all ${
              activeTab === 'inventories'
                ? 'bg-slate-900 text-white shadow-sm border border-slate-800'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Database className={`h-4.5 w-4.5 ${activeTab === 'inventories' ? 'text-blue-400' : 'text-slate-500'}`} />
            <span>Inventories</span>
          </button>

          {/* Salesforce */}
          <button
            id="nav-btn-salesforce"
            onClick={() => setActiveTab('salesforce')}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all ${
              activeTab === 'salesforce'
                ? 'bg-slate-900 text-white shadow-sm border border-slate-800'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <UserCheck className={`h-4.5 w-4.5 ${activeTab === 'salesforce' ? 'text-blue-400' : 'text-slate-500'}`} />
            <span>Salesforce CRM</span>
          </button>

          {/* Odoo */}
          <button
            id="nav-btn-odoo"
            onClick={() => setActiveTab('odoo')}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all ${
              activeTab === 'odoo'
                ? 'bg-[#714B67]/20 text-[#E1D3DC] shadow-sm border border-[#714B67]/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Layers className={`h-4.5 w-4.5 ${activeTab === 'odoo' ? 'text-purple-400' : 'text-slate-500'}`} />
            <span>Odoo Client</span>
          </button>

          {/* Flow Logs */}
          <button
            id="nav-btn-tickets"
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all ${
              activeTab === 'tickets'
                ? 'bg-slate-900 text-white shadow-sm border border-slate-800'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <CloudLightning className={`h-4.5 w-4.5 ${activeTab === 'tickets' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Flow Logs</span>
          </button>
        </nav>
      </div>

      {/* Profile & Credits sidebar info */}
      <div className="mt-auto p-6 space-y-4">
        <div className="bg-slate-900/40 border border-slate-900/80 rounded-xl p-3 text-[10.5px]">
          <p className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider">Current Session</p>
          <p className="text-zinc-205 font-bold mt-1 truncate">A.S. Shovon</p>
          <p className="text-[10px] text-zinc-500 truncate">asshovon15@gmail.com</p>
        </div>

        <button
          id="nav-btn-support"
          onClick={openTicketModal}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
          title="File automated ticket flow"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Support Ticket</span>
        </button>
      </div>
    </aside>
  );
}


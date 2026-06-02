import React, { useState } from 'react';
import Navbar from './components/Navbar';
import InventoryManager from './components/InventoryManager';
import SalesforceSync from './components/SalesforceSync';
import OdooApp from './components/OdooApp';
import FlowLogs from './components/FlowLogs';
import SupportTicketModal from './components/SupportTicketModal';
import { HelpCircle, ShieldCheck } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<'inventories' | 'salesforce' | 'odoo' | 'tickets'>('inventories');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeInventoryTitle, setActiveInventoryTitle] = useState('');

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden border border-slate-200" id="master-viewport-frame">
      {/* 1. Left Sidebar Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => setActiveTab(tab)} 
        openTicketModal={() => setIsTicketModalOpen(true)}
      />

      {/* 2. Main Content of Dashboard */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Bar */}
        <header className="h-20 bg-white border-b border-slate-205 flex items-center justify-between px-8 shrink-0 shadow-xs">
          <div>
            <h1 className="text-[17px] font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'inventories' && 'Aggregated Course Inventories'}
              {activeTab === 'salesforce' && 'Salesforce CRM Handshake Node'}
              {activeTab === 'odoo' && 'Odoo Enterprise ERP Module'}
              {activeTab === 'tickets' && 'Unified Sync Diagnostics Matrix'}
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              {activeTab === 'inventories' && 'Core course warehouse records, property dynamic schematics, and secure API bindings.'}
              {activeTab === 'salesforce' && 'Map local administrator accounts to SObjects (Account & Contact relational hierarchies).'}
              {activeTab === 'odoo' && 'Read-only externally accessible viewer compiling JSON metrics securely via REST Token streams.'}
              {activeTab === 'tickets' && 'System tracing dashboard displaying verified data entry records, file transfers, and notification relays.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Authorized Agent</p>
              <p className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">A.S. Shovon</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center border border-slate-800 font-bold text-sm tracking-tight select-none">
              AS
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-y-auto space-y-6 bg-slate-50">
          {activeTab === 'inventories' && (
            <div className="space-y-2 animate-fade-in" id="inventory-manager-view">
              <InventoryManager onInventorySelected={(title) => {
                setActiveInventoryTitle(title);
              }} />
            </div>
          )}

          {activeTab === 'salesforce' && (
            <div className="space-y-2 animate-fade-in" id="salesforce-sync-view">
              <SalesforceSync />
            </div>
          )}

          {activeTab === 'odoo' && (
            <div className="space-y-2 animate-fade-in" id="odoo-app-view">
              <OdooApp />
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-2 animate-fade-in" id="flow-logs-view">
              <FlowLogs />
            </div>
          )}
        </div>

        {/* Footer Info bar */}
        <footer className="h-12 bg-slate-100 border-t border-slate-200 flex items-center px-8 justify-between shrink-0 text-xs text-slate-500 font-sans">
          <div className="flex items-center gap-6 text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider">
            <span>System v2.4.1</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Environment API: Online
            </span>
            <span className="hidden md:inline text-slate-400">Power Automate Flow: [Active]</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('tickets')}
              className="hover:text-blue-600 transition-colors flex items-center gap-1 font-semibold text-xs text-slate-600 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>System Connected</span>
            </button>

            <span className="text-slate-300">|</span>

            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="text-amber-800 hover:text-amber-950 font-bold underline transition flex items-center cursor-pointer text-xs"
              id="footer-ticket-link"
            >
              <HelpCircle className="h-4 w-4 mr-1.5 text-amber-600 animate-bounce" />
              <span>Create support ticket</span>
            </button>
          </div>
        </footer>
      </div>

      {/* Support Ticket modal Overlay */}
      <SupportTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        activeInventoryTitle={activeInventoryTitle}
      />
    </div>
  );
}

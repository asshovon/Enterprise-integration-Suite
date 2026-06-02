import React, { useState, useEffect } from 'react';
import { 
  Terminal, ShieldCheck, Database, Layers, Send, RefreshCw, Key, FileCode, CheckCircle 
} from "lucide-react";
import { SalesforceSyncRecord, OdooInventory, SupportTicket } from "../types";

export default function FlowLogs() {
  const [sfLogs, setSfLogs] = useState<SalesforceSyncRecord[]>([]);
  const [odooLogs, setOdooLogs] = useState<OdooInventory[]>([]);
  const [ticketLogs, setTicketLogs] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [sfRes, odooRes, ticketRes] = await Promise.all([
        fetch('/api/salesforce/records'),
        fetch('/api/odoo/inventories'),
        fetch('/api/tickets')
      ]);

      const [sfData, odooData, ticketData] = await Promise.all([
        sfRes.json(),
        odooRes.json(),
        ticketRes.json()
      ]);

      setSfLogs(sfData);
      setOdooLogs(odooData);
      setTicketLogs(ticketData);
    } catch (e) {
      console.error("Failed to query log registry: ", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="integration-logs-hub">
      {/* Header bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-white flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono tracking-widest bg-zinc-850 px-2 py-0.5 rounded font-bold uppercase text-zinc-400">
            Enterprise Audit Logs
          </span>
          <h1 className="font-sans font-bold text-base mt-1 text-white select-none">
            Unified Sync Diagnostics Matrix
          </h1>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Trace JSON transfers, Rest hooks, and OAuth handshake schemas.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          id="btn-force-logs-refresh"
          className="p-2 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition rounded-xl text-zinc-300"
          title="Query latest logs"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salesforce Logs section */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-205 shadow-xs flex flex-col justify-between min-h-[400px]">
          <div>
            <h3 className="font-sans font-bold text-sm text-zinc-950 flex items-center mb-1">
              <ShieldCheck className="h-4.5 w-4.5 text-sky-500 mr-2" />
              Salesforce SObjects Logs
            </h3>
            <span className="text-[9.5px] uppercase font-mono text-zinc-400 font-semibold tracking-wider">Account & Contact Relational Syncs</span>
            
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {sfLogs.length === 0 ? (
                <p className="text-zinc-405 italic text-xs py-10 text-center">No active Salesforce handshake logs captured.</p>
              ) : (
                sfLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-sky-50/20 border border-sky-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="font-bold text-sky-850">{log.companyName}</span>
                      <span className="px-1.5 py-0.5 font-bold uppercase rounded bg-sky-100 text-sky-600 border border-sky-200">
                        {log.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-[10px] font-sans text-zinc-650 leading-relaxed pt-1.5 border-t border-sky-100/50">
                      <div className="flex justify-between">
                        <span>Account ID:</span>
                        <span className="font-mono text-zinc-800 font-bold">{log.salesforceAccountId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contact ID:</span>
                        <span className="font-mono text-zinc-800 font-bold">{log.salesforceContactId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date Synced:</span>
                        <span className="text-zinc-500">{new Date(log.syncedAt || '').toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Odoo Logs section */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-205 shadow-xs flex flex-col justify-between min-h-[400px]">
          <div>
            <h3 className="font-sans font-bold text-sm text-[#714B67] flex items-center mb-1">
              <Database className="h-4.5 w-4.5 text-[#714B67] mr-2" />
              Odoo secure Token Syncs
            </h3>
            <span className="text-[9.5px] uppercase font-mono text-zinc-400 font-semibold tracking-wider">REST API telemetry pulls</span>
            
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {odooLogs.length === 0 ? (
                <p className="text-zinc-405 italic text-xs py-10 text-center">No active Odoo telemetry fetches captured.</p>
              ) : (
                odooLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-purple-50/20 border border-purple-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="font-bold text-purple-950">{log.inventoryTitle}</span>
                      <span className="px-1.5 py-0.5 font-bold uppercase text-[9px] rounded bg-purple-100 border border-purple-200 text-[#714B67]">
                        SUCCESS
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] font-sans text-zinc-650 leading-relaxed pt-1.5 border-t border-purple-100/50">
                      <div className="flex justify-between">
                        <span>Sync Token:</span>
                        <span className="font-mono font-bold text-zinc-700 truncate max-w-[100px]">{log.apiTokenUsed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimensions:</span>
                        <span className="text-zinc-800">{log.fields.length} dimensions</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date Queried:</span>
                        <span className="text-zinc-500">{new Date(log.importedAt || '').toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Power Automate logs section */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-205 shadow-xs flex flex-col justify-between min-h-[400px]">
          <div>
            <h3 className="font-sans font-bold text-sm text-zinc-950 flex items-center mb-1">
              <Send className="h-4.5 w-4.5 text-amber-500 mr-2" />
              Power Automate Tickets
            </h3>
            <span className="text-[9.5px] uppercase font-mono text-zinc-400 font-semibold tracking-wider">OneDrive files & Push Triggers</span>
            
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {ticketLogs.length === 0 ? (
                <p className="text-zinc-405 italic text-xs py-10 text-center">No active cloud ticket trigger events captured.</p>
              ) : (
                ticketLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-amber-50/20 border border-amber-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="font-bold text-amber-950 truncate max-w-[140px]">{log.summary}</span>
                      <span className="px-1.5 py-0.5 font-bold uppercase rounded bg-amber-100 text-amber-700 border border-amber-200">
                        {log.priority}
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] font-sans text-zinc-650 leading-relaxed pt-1.5 border-t border-amber-100/50">
                      <div className="flex justify-between">
                        <span>Target Admins:</span>
                        <span className="font-mono text-zinc-705 truncate max-w-[110px]">{log.adminEmails.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded flex items-center">
                          <CheckCircle className="h-2.5 w-2.5 mr-0.5 inline" />
                          OneDrive Write
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="text-zinc-500">{new Date(log.createdAt || '').toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

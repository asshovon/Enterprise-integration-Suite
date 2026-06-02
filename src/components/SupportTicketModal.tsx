import React, { useState, useEffect } from 'react';
import { 
  X, HelpCircle, FileJson, Mail, Send, CheckCircle, Smartphone, Sliders, Bell, ArrowRight, Download, Server
} from "lucide-react";
import { SupportTicket } from "../types";

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeInventoryTitle: string;
}

export default function SupportTicketModal({ isOpen, onClose, activeInventoryTitle }: SupportTicketModalProps) {
  const [summary, setSummary] = useState('');
  const [priority, setPriority] = useState<'High' | 'Average' | 'Low'>('Average');
  const [adminEmails, setAdminEmails] = useState('asshovon15@gmail.com, superadmin@university.edu');
  const [webhookUrl, setWebhookUrl] = useState(''); // Real Power Automate webhook POST URL
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SupportTicket | null>(null);
  const [error, setError] = useState('');
  const [showPhoneNotification, setShowPhoneNotification] = useState(false);
  const [notifDetails, setNotifDetails] = useState({ title: '', body: '' });

  // Update support contexts
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-mipjftu65lj6d27koip36d-816132878936.asia-southeast1.run.app/#/inventory';

  // Clear states on close/open
  useEffect(() => {
    if (isOpen) {
      setSuccess(null);
      setError('');
      setShowPhoneNotification(false);
    }
  }, [isOpen]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    setLoading(true);
    setError('');
    
    const emailList = adminEmails.split(',').map(email => email.trim()).filter(email => email.length > 0);

    try {
      const res = await fetch('/api/tickets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          priority,
          reportedBy: "asshovon15@gmail.com",
          inventoryTitle: activeInventoryTitle || "N/A",
          link: currentUrl,
          adminEmails: emailList,
          webhookUrl: webhookUrl.trim()
        })
      });

      const ticketResult = await res.json() as SupportTicket;
      if (!res.ok) throw new Error(ticketResult.summary || "Failed to submit ticket.");

      setSuccess(ticketResult);
      setSummary('');

      // Trigger high-fidelity phone notification simulator
      setTimeout(() => {
        setNotifDetails({
          title: `⚠️ [${priority}] support alert`,
          body: `Ticket: "${ticketResult.summary.substring(0, 40)}${ticketResult.summary.length > 40 ? '...' : ''}" filed on inventory [${ticketResult.inventoryTitle}]`
        });
        setShowPhoneNotification(true);
      }, 1500);

    } catch (err: any) {
      setError("Ticket uploading issues: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!success) return;
    
    const formattedObj = {
      "Reported by": success.reportedBy,
      "Inventory": success.inventoryTitle,
      "Link": success.link,
      "Priority": success.priority,
      "Summary": success.summary,
      "Requested Admins": success.adminEmails,
      "Timestamp": success.createdAt
    };

    const fileBlob = new Blob([JSON.stringify(formattedObj, null, 2)], { type: 'application/json' });
    const localUrl = URL.createObjectURL(fileBlob);
    const linkTag = document.createElement('a');
    linkTag.href = localUrl;
    linkTag.download = `support_ticket_${success.id}.json`;
    document.body.appendChild(linkTag);
    linkTag.click();
    document.body.removeChild(linkTag);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50 bg-zinc-950/65 backdrop-blur-xs" id="support-ticket-flow-overlay">
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl p-6 mx-4 relative grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[90vh] overflow-y-auto animate-zoom-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 bg-zinc-50 border border-zinc-200 p-1.5 rounded-full transition"
          title="Dismiss portal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Column Left: Inputs Form */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-6 w-6 text-amber-500" />
            <div>
              <h2 className="font-sans font-bold text-lg text-zinc-900 leading-snug">Power Automate Flow Desk</h2>
              <span className="text-[10px] uppercase font-mono bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded font-bold">
                Automated پشتیبانی trigger
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 font-sans max-w-md leading-relaxed">
            From any screen, dispatch supportive logs. Submitting generates a compliance-tested JSON, stores it in Cloud Folders (OneDrive/Dropbox Simulation), and fires custom Power Automate Webhooks.
          </p>

          {!success ? (
            <form onSubmit={handleSubmitTicket} className="space-y-4 pt-1" id="ticket-inputs-form">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                  Support Ticket summary *
                </label>
                <textarea
                  required
                  placeholder="e.g. Storage thermostat reading fluctuations, Silicon Corp chip volume mismatched..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                    Priority Tier *
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full text-xs font-sans border border-zinc-200 rounded-lg p-2 bg-white"
                  >
                    <option value="High">🔴 High Priority (Gmail Express)</option>
                    <option value="Average">🟡 Average Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                    Subject Inventory Location
                  </label>
                  <div className="w-full border border-zinc-150 px-3 py-2 bg-zinc-50 rounded-lg text-zinc-700 text-xs font-medium font-sans truncate">
                    {activeInventoryTitle || "None Selected"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                  Recipient Administrator Emails (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={adminEmails}
                  onChange={(e) => setAdminEmails(e.target.value)}
                  className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="border border-zinc-150 p-3.5 rounded-2xl bg-zinc-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider flex items-center">
                    <Server className="h-3 w-3 mr-1 text-sky-500" />
                    Real Power Automate Webhook URL
                  </span>
                  <span className="text-[9px] text-[#2b579a] font-sans font-bold uppercase">OneDrive / Gmail API</span>
                </div>
                <input
                  type="url"
                  placeholder="Paste HTTP POST Trigger URL (https://prod-xx.westus.logic.azure.com...)"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full text-[10.5px] font-mono border border-zinc-200 rounded-md px-2.5 py-1.5 bg-white shadow-xs"
                />
                <p className="text-[9.5px] text-zinc-400 font-sans leading-tight">
                  * Optional. Type high-standard endpoints from Azure/Power Automate logic apps. Dispatches the actual JSON file payload.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-zinc-200 font-sans text-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-50 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-805 text-white rounded-lg text-xs font-semibold font-sans transition flex items-center space-x-2"
                >
                  <Send className="h-3.5 w-3.5 mr-1" />
                  <span>{loading ? "Uploading Support Package..." : "File JSON Ticket"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 pt-2 text-xs font-sans" id="ticket-success-receipt">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">Automation Webhook Dispatched!</h3>
                  <p className="text-xs text-emerald-800 mt-1">
                    JSON payload created with secure schemas and deposited onto OneDrive database folder structures.
                  </p>
                </div>
              </div>

              {/* JSON Visual inspection schema */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-zinc-300">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-3.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center">
                    <FileJson className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
                    support_ticket_{success.id}.json
                  </span>
                  <button
                    onClick={handleDownloadJSON}
                    className="p-1 px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 transition text-[11px] font-semibold text-zinc-200 flex items-center space-x-1"
                    title="Export static file"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download JSON</span>
                  </button>
                </div>

                <pre className="text-[10px] text-emerald-400 font-mono leading-relaxed select-all overflow-x-auto">
{JSON.stringify({
  "Reported by": success.reportedBy,
  "Inventory": success.inventoryTitle,
  "Link": success.link,
  "Priority": success.priority,
  "Summary": success.summary,
  "Requested Admins": success.adminEmails,
  "Timestamp": success.createdAt
}, null, 2)}
                </pre>
              </div>

              <div className="flex space-x-2 justify-start pt-2 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={() => setSuccess(null)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-semibold rounded-lg text-xs transition"
                >
                  File another Ticket
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold rounded-lg text-xs transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-650 text-xs font-semibold text-center italic">{error}</p>
          )}
        </div>

        {/* Column Right: Live Smartphone Screen Simulation */}
        <div className="md:col-span-5 bg-zinc-50 p-5 rounded-2xl border border-zinc-200 flex flex-col items-center justify-between min-h-[360px]" id="phone-simulation-column">
          <div className="w-full text-center">
            <h4 className="font-sans font-bold text-xs text-zinc-800 flex items-center justify-center uppercase tracking-widest text-[9.5px] text-zinc-400">
              <Smartphone className="h-3.5 w-3.5 mr-1 text-zinc-400" />
              Admin Phone Monitor
            </h4>
            <p className="text-[9.5px] text-zinc-500 font-sans tracking-tight mt-1">
              Demonstrates real-time Power Automate push alerts arriving in administrative handsets.
            </p>
          </div>

          {/* Handset Mockup Container */}
          <div className="relative border-4 border-zinc-900 bg-zinc-950 rounded-3xl h-[260px] w-[160px] flex flex-col justify-start overflow-hidden shadow-lg shadow-zinc-3 w-11/12 mt-4 select-none">
            {/* Camera notch */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 h-3.5 w-14 bg-zinc-900 rounded-full z-10"></div>
            
            {/* Status bar */}
            <div className="flex justify-between items-center px-4 pt-1.5 text-[8px] text-zinc-400 font-mono">
              <span>19:21</span>
              <span>📶 🔋 100%</span>
            </div>

            {/* Simulated Desktop Wallpaper */}
            <div className="flex-1 w-full relative bg-radial from-slate-800 via-zinc-900 to-black p-2 flex flex-col justify-center items-center">
              
              {showPhoneNotification ? (
                /* Arriving notification bubble animation */
                <div className="w-full bg-white/95 border border-zinc-200/50 p-2 rounded-xl shadow-lg flex flex-col space-y-1 text-zinc-950 relative animate-slide-down pointer-events-none">
                  {/* Notification Header */}
                  <div className="flex items-center justify-between text-[7.5px] font-sans font-bold border-b border-zinc-150 pb-0.5">
                    <span className="text-[#2b579a] flex items-center">
                      <Bell className="h-2 w-2 mr-0.5 text-[#2b579a] animate-bounce" />
                      Power Automate
                    </span>
                    <span className="text-zinc-500">now</span>
                  </div>
                  {/* Title */}
                  <span className="text-[8px] font-extrabold uppercase font-sans text-amber-900 leading-tight">
                    {notifDetails.title}
                  </span>
                  {/* Description */}
                  <span className="text-[7.5px] font-sans leading-normal text-zinc-600 truncate-2-lines line-clamp-2">
                    {notifDetails.body}
                  </span>
                </div>
              ) : (
                /* Blank Lockscreen display details */
                <div className="text-center font-sans space-y-1.5 opacity-80 pt-4">
                  <p className="text-[28px] font-extralight text-white font-sans tracking-tight">19:21</p>
                  <p className="text-[8px] text-zinc-400 uppercase tracking-widest font-bold">Tuesday, June 2</p>
                  <p className="text-[7.5px] text-zinc-500 italic mt-8 animate-pulse">Waiting for push trigger...</p>
                </div>
              )}
            </div>

            {/* Swipe indicator bar */}
            <div className="w-14 h-1.5 bg-zinc-700 rounded-full mx-auto mb-1"></div>
          </div>

          {/* Legend flow indicator */}
          <div className="w-full text-center mt-3 pt-3 border-t border-zinc-200 flex justify-center items-center space-x-1 font-sans text-[10px] text-zinc-400 italic">
            <span>JSON Submit</span>
            <ArrowRight className="h-3 w-3" />
            <span>Flow Runs</span>
            <ArrowRight className="h-3 w-3" />
            <span>Mobile Push!</span>
          </div>
        </div>

      </div>
    </div>
  );
}

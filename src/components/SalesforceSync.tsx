import React, { useState, useEffect } from 'react';
import { 
  User, CheckCircle2, ShieldAlert, Terminal, RefreshCw, Layers, Database, CreditCard, ExternalLink, Settings, Eye, EyeOff 
} from "lucide-react";
import { SalesforceSyncRecord } from "../types";

export default function SalesforceSync() {
  const [records, setRecords] = useState<SalesforceSyncRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Salesforce Credentials Setup
  const [useDemo, setUseDemo] = useState(true);
  const [instanceUrl, setInstanceUrl] = useState('https://login.salesforce.com');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showCreds, setShowCreds] = useState(false);

  // Profile data collection form
  const [companyName, setCompanyName] = useState('Antigravity Laboratories Inc.');
  const [industry, setIndustry] = useState('Technology');
  const [billingStreet, setBillingStreet] = useState('1600 Amphitheatre Parkway');
  const [billingCity, setBillingCity] = useState('Mountain View');
  const [billingCountry, setBillingCountry] = useState('United States');
  const [phone, setPhone] = useState('+1 (650) 253-0000');
  const [annualRevenue, setAnnualRevenue] = useState('12500000');
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [secondaryEmail, setSecondaryEmail] = useState('developer.asshovon15@gmail.com');
  
  const [activeRecord, setActiveRecord] = useState<SalesforceSyncRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSyncRecords();
  }, []);

  const fetchSyncRecords = async () => {
    try {
      const res = await fetch('/api/salesforce/records');
      const data = await res.json();
      setRecords(data);
      if (data.length > 0) {
        setActiveRecord(data[data.length - 1]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncToSalesforce = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorCode('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/salesforce/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          industry,
          billingStreet,
          billingCity,
          billingCountry,
          phone,
          annualRevenue,
          useDemo,
          sfCredentials: useDemo ? null : {
            instanceUrl,
            username,
            password,
            clientId,
            clientSecret
          }
        })
      });

      const data = await res.json();
      
      // Update local records
      setRecords(prev => [...prev, data]);
      setActiveRecord(data);

      if (res.ok) {
        setSuccessMsg(`Account and linked Contact synchronised to Salesforce dev database!`);
        setIsModalOpen(false);
      } else {
        setErrorCode(data.error || "Integration sync failed due to credential boundaries.");
      }
    } catch (err: any) {
      setErrorCode(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="salesforce-sync-layout">
      {/* Profile Details & Credentials column */}
      <div className="lg:col-span-5 space-y-6">
        {/* User profile card */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs" id="dev-profile-card">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 bg-zinc-900 rounded-full flex justify-center items-center text-white ring-4 ring-zinc-50 border border-zinc-200">
              <User className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ADMIN ACCESS AUTHORIZED
              </span>
              <h2 className="font-sans font-bold text-lg text-zinc-900 tracking-tight mt-1">
                A.S. Shovon
              </h2>
              <p className="font-mono text-zinc-500 text-xs">asshovon15@gmail.com</p>
            </div>
          </div>

          <div className="space-y-3.5 border-t border-zinc-150 pt-4 text-xs font-sans">
            <div className="flex justify-between items-center text-zinc-600">
              <span>Platform Role:</span>
              <span className="font-semibold text-zinc-950">Integration Lead</span>
            </div>
            <div className="flex justify-between items-center text-zinc-600">
              <span>Workspace URL:</span>
              <span className="font-mono text-[11px] text-zinc-900 select-all border-b border-zinc-150">
                {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-600">
              <span>Course Assignment:</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px] uppercase font-mono font-bold">
                C# Salesforce Integration
              </span>
            </div>
          </div>

          {/* Prompt Sync Actions */}
          <div className="mt-6">
            <button
              id="btn-trigger-sf-modal"
              onClick={() => setIsModalOpen(true)}
              className="w-full flex justify-center items-center py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-semibold font-sans hover:bg-zinc-800 transition shadow-xs"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              CRM Sync Action (Generate SObjects)
            </button>
            <p className="text-[10px] text-zinc-400 mt-2 font-sans italic text-center">
              * Generates Salesforce 'Account' with linked 'Contact' relational model.
            </p>
          </div>
        </div>

        {/* Credentials Config Panel */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs" id="sf-creds-config">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-sans font-bold text-sm text-zinc-900 flex items-center">
              <Settings className="h-4 w-4 mr-1.5 text-zinc-400" />
              Salesforce Credentials Setup
            </h3>
            <button
              onClick={() => setShowCreds(!showCreds)}
              className="text-zinc-500 hover:text-zinc-900 text-xs font-sans font-medium flex items-center space-x-1"
            >
              {showCreds ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Show
                </>
              )}
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between border border-zinc-200 p-2.5 rounded-xl bg-zinc-50/50">
              <div>
                <p className="text-xs font-semibold text-zinc-800 font-sans">
                  Use Simulation Environment
                </p>
                <p className="text-[10px] text-zinc-400 font-sans">
                  Produces detailed mock transactions for assignment validation.
                </p>
              </div>
              <input
                type="checkbox"
                checked={useDemo}
                onChange={(e) => setUseDemo(e.target.checked)}
                className="w-4 h-4 text-zinc-950 border-zinc-300 rounded-md focus:ring-zinc-900"
              />
            </div>
          </div>

          {showCreds && !useDemo && (
            <div className="space-y-3 pt-2 border-t border-zinc-150 animate-fade-in" id="sf-creds-fields">
              <div>
                <label className="block text-[10px] font-mono font-semibold uppercase text-zinc-400 mb-1">
                  Login Server Instance URL
                </label>
                <input
                  type="text"
                  placeholder="https://login.salesforce.com"
                  value={instanceUrl}
                  onChange={(e) => setInstanceUrl(e.target.value)}
                  className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold uppercase text-zinc-400 mb-1">
                  Salesforce Developer Username
                </label>
                <input
                  type="email"
                  placeholder="e.g. developer@company.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold uppercase text-zinc-400 mb-1">
                  Password & Security Token (Concatenated)
                </label>
                <input
                  type="password"
                  placeholder="e.g. MyPassword123xyzTokenSecret456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase text-zinc-400 mb-1">
                    OAuth Client ID
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase text-zinc-400 mb-1">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white shadow-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terminal logs and Visual CRM Database schema visualization column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Error / Success Status indicators */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-100 flex items-center shadow-xs animate-fade-in">
            <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600 flex-shrink-0" />
            <span className="font-sans font-medium">{successMsg}</span>
          </div>
        )}

        {errorCode && (
          <div className="p-4 rounded-xl bg-red-50 text-red-800 text-xs border border-red-100 flex items-center shadow-xs animate-fade-in">
            <ShieldAlert className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
            <span className="font-sans font-medium">{errorCode}</span>
          </div>
        )}

        {/* Console / REST API Log Window */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-md flex flex-col" id="sf-terminal">
          <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between border-b border-zinc-800">
            <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 flex items-center uppercase">
              <Terminal className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
              SObjects API Developer Logs
            </span>
            <div className="flex space-x-1.5">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            </div>
          </div>

          <div className="p-4 font-mono text-[11px] text-zinc-300 min-h-[180px] max-h-[300px] overflow-y-auto space-y-1.5 select-all">
            {activeRecord ? (
              activeRecord.logs.map((log, index) => (
                <div key={index} className="leading-relaxed">
                  {log.startsWith('CRITICAL') || log.includes('ERROR') ? (
                    <span className="text-red-400">{log}</span>
                  ) : log.includes('Response:') ? (
                    <span className="text-emerald-400">{log}</span>
                  ) : log.includes('[Payload]') ? (
                    <span className="text-amber-400/90 font-semibold">{log}</span>
                  ) : (
                    <span className="text-zinc-300">{log}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-zinc-500 italic">No sync cycles detected. Press "CRM Sync Action" to record database linkage transaction logs.</p>
            )}
          </div>
        </div>

        {/* Visual Salesforce Schema Cards */}
        {activeRecord && activeRecord.status === 'success' && (
          <div className="bg-white p-5 border border-zinc-200 rounded-2xl shadow-xs" id="sf-relational-model">
            <h3 className="font-sans font-bold text-sm text-zinc-900 mb-4 flex items-center">
              <Layers className="h-4 w-4 mr-1.5 text-sky-500" />
              Salesforce Data Architecture Schema
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {/* Account Object Card */}
              <div className="border border-sky-100 bg-sky-50/20 p-4 rounded-xl relative">
                <span className="text-[8px] font-bold font-mono tracking-widest text-sky-500 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded uppercase">
                  Account OBJECT SObject
                </span>

                <div className="mt-3.5 space-y-2 font-sans text-xs">
                  <div className="flex justify-between border-b border-sky-100/50 pb-1">
                    <span className="text-zinc-500">Account ID:</span>
                    <span className="font-mono font-bold text-sky-900">{activeRecord.salesforceAccountId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Name:</span>
                    <span className="font-bold text-zinc-850 truncate max-w-[130px]">{activeRecord.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Industry:</span>
                    <span className="font-medium text-zinc-700">{activeRecord.industry}</span>
                  </div>
                </div>
              </div>

              {/* Contact Object Linked Card */}
              <div className="border border-emerald-100 bg-emerald-50/20 p-4 rounded-xl relative">
                <span className="text-[8px] font-bold font-mono tracking-widest text-emerald-500 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                  Contact OBJECT SObject
                </span>

                <div className="mt-3.5 space-y-2 font-sans text-xs">
                  <div className="flex justify-between border-b border-emerald-100/50 pb-1">
                    <span className="text-zinc-500">Contact ID:</span>
                    <span className="font-mono font-bold text-emerald-900">{activeRecord.salesforceContactId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Parent Link:</span>
                    <span className="font-mono font-bold text-sky-700 bg-sky-100 px-1 py-0.5 rounded text-[10px]">
                      AccountId → {activeRecord.salesforceAccountId?.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Linked User:</span>
                    <span className="font-bold text-zinc-800">A.S. Shovon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CRM Dynamic Collection Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent flex justify-center items-center z-55 bg-zinc-950/65 backdrop-blur-xs" id="sf-form-popup">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-xl p-6 mx-4 relative max-h-[90vh] overflow-y-auto">
            <h3 className="font-sans font-bold text-base text-zinc-900 mb-1">
              Salesforce Account & Contact Sync
            </h3>
            <p className="text-xs text-zinc-500 font-sans mb-5 leading-tight">
              Incorporate secondary account traits (Annual Revenue, Addresses, Contacts) to establish correct CRM records in Salesforce Developer Org.
            </p>

            <form onSubmit={handleSyncToSalesforce} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                    Industry Type *
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-2 py-2 bg-white"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Energy">Energy</option>
                    <option value="Finance">Financial Services</option>
                    <option value="Retail">Retail</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                    Annual Revenue ($ USD) *
                  </label>
                  <input
                    type="number"
                    required
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(e.target.value)}
                    className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                  Billing Street Address
                </label>
                <input
                  type="text"
                  value={billingStreet}
                  onChange={(e) => setBillingStreet(e.target.value)}
                  className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                    Billing City
                  </label>
                  <input
                    type="text"
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                    className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                    Billing Country
                  </label>
                  <input
                    type="text"
                    value={billingCountry}
                    onChange={(e) => setBillingCountry(e.target.value)}
                    className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2 bg-white"
                  />
                </div>
              </div>

              <div className="border border-zinc-150 p-3.5 rounded-xl bg-zinc-50/50 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">Secondary Contact Properties</span>
                
                <div>
                  <label className="block text-[11px] font-sans text-zinc-600 mb-1">Secondary Developer Email</label>
                  <input
                    type="email"
                    value={secondaryEmail}
                    onChange={(e) => setSecondaryEmail(e.target.value)}
                    className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>

                <label className="flex items-center space-x-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="w-4 h-4 text-zinc-950 border-zinc-300 rounded focus:ring-zinc-900"
                  />
                  <span className="text-xs text-zinc-500 font-sans">
                    Enable marketing newsletters & priority communications with Salesforce links
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 bg-white rounded-lg text-xs font-semibold font-sans hover:bg-zinc-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-850 rounded-lg text-xs font-semibold font-sans transition flex items-center space-x-2"
                >
                  {loading && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                  <span>{loading ? "Sending SObjects..." : "Submit to Salesforce CRM"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

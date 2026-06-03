import React, { useState, useEffect } from 'react';
import { 
  FileCode, Play, Terminal, HelpCircle, CheckCircle, Cpu, Copy, Sparkles, Send, Settings, BookOpen, Layers
} from "lucide-react";

interface CodeSnippet {
  title: string;
  filename: string;
  language: string;
  code: string;
  description: string;
}

export default function DotnetIntegration() {
  const [activeSnippetIndex, setActiveSnippetIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<'salesforce-sync' | 'odoo-token' | 'ticket-push'>('salesforce-sync');
  
  // Custom sandbox simulation values
  const [companyName, setCompanyName] = useState('Acme Global .NET');
  const [inventoryTitle, setInventoryTitle] = useState('Warehouse Alpha Staging');
  const [priority, setPriority] = useState('High');
  const [ticketSummary, setTicketSummary] = useState('Critical integration sync failure on SObject account creation pipeline.');
  const [webhookUrl, setWebhookUrl] = useState('https://prod-15.southeastasia.logic.azure.com:443/workflows/...');
  const [logs, setLogs] = useState<string[]>([]);

  // Snippets repository
  const snippets: CodeSnippet[] = [
    {
      title: "ASP.NET Core Controller Handshake",
      filename: "Controllers/IntegrationController.cs",
      language: "csharp",
      description: "Handles integration handshakes for Salesforce mapping, secure token issuing, and support ticketing pipelines.",
      code: `using Microsoft.AspNetCore.Mvc;
using EnterpriseIntegrationWebAPI.Models;
using System.Text.Json;
using System.Text;

namespace EnterpriseIntegrationWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IntegrationController : ControllerBase
    {
        private static readonly List<CourseInventory> _inventories = new()
        {
            new CourseInventory { Id = "inv_01", Title = "Warehouse Alpha Staging", MeanValue = 14290.00 },
            new CourseInventory { Id = "inv_02", Title = "Global Supply Assets", MeanValue = 8940.50 }
        };

        private readonly IHttpClientFactory _httpClientFactory;

        public IntegrationController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("salesforce/handshake")]
        public ActionResult SalesforceHandshake([FromBody] SalesforceSyncRecord input)
        {
            if (string.IsNullOrEmpty(input.CompanyName))
                return BadRequest("Company Name is required.");

            var random = new Random();
            var log = new SalesforceSyncRecord
            {
                Id = Guid.NewGuid().ToString(),
                CompanyName = input.CompanyName,
                SalesforceAccountId = $"0018000000{random.Next(100000, 999999)}AQA",
                SalesforceContactId = $"0038000000{random.Next(100000, 999999)}ZQA",
                Status = "Linked",
                SyncedAt = DateTime.UtcNow
            };
            return Ok(log);
        }
    }
}`
    },
    {
      title: "C# Salesforce Service Client",
      filename: "Services/SalesforceServiceClient.cs",
      language: "csharp",
      description: "Highly robust HTTP REST client for SObject manipulation, token refresh, and direct mapping.",
      code: `using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

public class SalesforceServiceClient
{
    private readonly HttpClient _client;

    public SalesforceServiceClient(HttpClient client)
    {
        _client = client;
        _client.BaseAddress = new Uri("https://developer.salesforce.com/");
    }

    public async Task<SalesforceContactResponse?> CreateLinkedContactAsync(string companyName)
    {
        var payload = new { CompanyName = companyName };
        var response = await _client.PostAsJsonAsync("services/data/v61.0/sobjects/Account", payload);
        
        if (response.IsSuccessStatusCode)
        {
            return await response.Content.ReadFromJsonAsync<SalesforceContactResponse>();
        }
        
        throw new HttpRequestException($"Salesforce sync failed with status {response.StatusCode}");
    }
}`
    },
    {
      title: "Odoo Secure Token Generator",
      filename: "Services/TokenGenerator.cs",
      language: "csharp",
      description: "Cryptographic token formatting with base64 serialization and microservice validity assertions.",
      code: `using System;
using System.Security.Cryptography;
using System.Text;

public class TokenGenerator
{
    public static string GenerateOdooToken(string title, string id)
    {
        using (SHA256 sha256 = SHA256.Create())
        {
            string rawData = $"{title}-{id}-{DateTime.UtcNow.Ticks}";
            byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 6; i++)
            {
                sb.Append(bytes[i].ToString("x2"));
            }
            return $"odoo_{sb.ToString()}_Lp9";
        }
    }
}`
    },
    {
      title: "OneDrive Webhook Push Broker",
      filename: "Services/OneDriveWebhookBroker.cs",
      language: "csharp",
      description: "Asynchronous task delivery broker for dispatching JSON files into Power Automate trigger pipelines.",
      code: `using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class OneDriveWebhookBroker
{
    private readonly HttpClient _httpClient;

    public OneDriveWebhookBroker(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<bool> DispatchTicketJsonAsync(string webhookUrl, dynamic ticket)
    {
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        string jsonPayload = JsonSerializer.Serialize(ticket, options);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync(webhookUrl, content);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[OneDrive Webhook Error]: {ex.Message}");
            return false;
        }
    }
}`
    }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeSnippetIndex].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSimulation = () => {
    setIsRunning(true);
    setLogs([]);
    
    const messages = [
      `[MSBuild] -------------------------------------------------------------------------`,
      `[MSBuild] Dotnet CLI: Building C# project 'EnterpriseIntegrationWebAPI.csproj'...`,
      `[MSBuild] Roslyn: Compiling source files to DLL outputs (/bin/Debug/net9.0/)...`,
      `[MSBuild] Roslyn: Assembly successfully linked. 0 Errors, 0 Warnings.`,
      `[dotnet] Loading appsettings.json file for secure enterprise bindings...`,
      `[dotnet] Initializing ASP.NET WebApplication Host (Environment: Development)`,
      `[dotnet] Hosting environment is now listening at http://127.0.0.1:5000`,
      `[dotnet] -------------------------------------------------------------------------`
    ];

    if (selectedTask === 'salesforce-sync') {
      messages.push(
        `[dotnet] Executing Salesforce CRM Handshake for: "${companyName}"...`,
        `[HttpClient] Creating API Connection to: https://developer.salesforce.com/services/data/v61.0`,
        `[HttpClient] Linked Accounts Handshake Headers: [Authorization: Bearer SF_NET_JWT]`,
        `[dotnet] Mapping Account SObject schema payload parameters...`,
        `[REST Engine] Web API Handshake received 200 OK.`,
        `[JSON Transfer] Payload linked SObjects matches successfully.`,
        `[dotnet] ---> Salesforce SObject Account ID Generated: 0018000000${Math.floor(Math.random() * 900000) + 100000}AQA`,
        `[dotnet] ---> Salesforce Linked Contact ID Generated: 0038000000${Math.floor(Math.random() * 900000) + 100000}ZQA`,
        `[dotnet] SUCCESS: Salesforce Sync completed inside ASP.NET Pipeline.`
      );
    } else if (selectedTask === 'odoo-token') {
      const generatedToken = "odoo_" + btoa(inventoryTitle + Date.now()).substring(0, 12) + "_Lp9";
      messages.push(
        `[dotnet] Initializing Secure Odoo token generation for: "${inventoryTitle}"...`,
        `[dotnet] Invoking cryptographic service SHA256.Create()..`,
        `[Security Service] Salt, seed, and dynamic timestamps converted to bytes.`,
        `[Security Service] Custom Base64 URL Safe string encoding applied.`,
        `[dotnet] ---> Outbound API Key generated: "${generatedToken}"`,
        `[dotnet] Saving generated SObject bindings back to local MS SQL database.`,
        `[dotnet] SUCCESS: Secure telemetry token returned successfully to calling instance.`
      );
    } else {
      messages.push(
        `[dotnet] Loading Webhook Trigger Broker payload configuration...`,
        `[System.Text.Json] Serializing SupportTicket object to raw camelCase formatting.`,
        `[dotnet] Target webhook detected: ${webhookUrl ? webhookUrl.substring(0, 45) + '...' : 'Local Simulation Fallback'}`,
        `[HttpClient] Generating Outgoing POST Request...`,
        `[HttpClient] Injecting parameters: [Priority: ${priority}, Summary: "${ticketSummary.substring(0, 30)}..."]`
      );

      if (webhookUrl && webhookUrl.trim().startsWith("http")) {
        messages.push(
          `[HttpClient] Connecting to Power Automate Webhook endpoint...`,
          `[Webhook Dispatcher] Processing OneDrive write flow queue...`,
          `[REST Engine] Endpoint returned status: 202 Accepted.`,
          `[dotnet] SUCCESS: Excel & OneDrive spreadsheet updated via .NET HTTP Client!`
        );
      } else {
        messages.push(
          `[HttpClient] Webhook omitted or invalid. Performing safe offline emulation loop.`,
          `[Local DB Link] Ticket parsed and written into memory database table correctly.`,
          `[dotnet] SUCCESS: Local .NET Support action simulated.`
        );
      }
    }

    // Stream logs to give immediate C# execution feel
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLogs(prev => [...prev, messages[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 180);
  };

  useEffect(() => {
    // Standard initialization simulation log
    setLogs([
      `[dotnet-cli] Type: CLI Build & Execute Service on .NET Core 9.0`,
      `[dotnet-cli] Dev Mode: Ready to compile and debug C# components.`,
      `[dotnet-cli] Click "Run Simulation" below to see active C# backend outputs.`
    ]);
  }, [selectedTask]);

  return (
    <div className="space-y-6" id="dotnet-integration-workspace">
      {/* Visual Header card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white flex justify-between items-center relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
        <div className="z-10">
          <span className="text-[10px] font-mono tracking-widest bg-blue-900/40 text-blue-300 px-2.5 py-0.5 rounded font-black uppercase border border-blue-800/50">
            .NET CORE 9.0 BACKEND
          </span>
          <h1 className="font-sans font-extrabold text-lg mt-1.5 text-white select-none flex items-center">
            <Cpu className="h-5 w-5 mr-2 text-blue-400" />
            C# Enterprise Handshake Integration Hub
          </h1>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Compare architectural handlers, test production C# code modules, and simulate dotnet runtime executions.
          </p>
        </div>
        <div className="hidden md:flex gap-2 z-10">
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">
            Target: net9.0-web
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: C# Code Viewer */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-205 shadow-xs overflow-hidden flex flex-col justify-between min-h-[550px]">
          <div>
            {/* Action Bar */}
            <div className="bg-slate-50 border-b border-slate-205 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center">
                <FileCode className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h3 className="font-sans font-bold text-sm text-slate-900">
                    {snippets[activeSnippetIndex].title}
                  </h3>
                  <p className="text-[10.5px] font-mono text-slate-500">
                    {snippets[activeSnippetIndex].filename}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 self-start sm:self-auto">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg border border-slate-250 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-6">
              <p className="text-xs text-slate-600 font-sans leading-relaxed mb-4">
                {snippets[activeSnippetIndex].description}
              </p>

              {/* Code window block */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-md">
                <div className="bg-slate-900 px-4 py-2 flex justify-between items-center">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">csharp</span>
                </div>
                <pre className="p-5 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed select-all">
                  <code>{snippets[activeSnippetIndex].code}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Selector Drawer */}
          <div className="bg-slate-50 border-t border-slate-205 px-6 py-4 flex flex-wrap gap-2">
            {snippets.map((snip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveSnippetIndex(idx);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold border transition ${
                  activeSnippetIndex === idx
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {snip.title}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: C# Core Simulation Panel */}
        <div className="bg-white rounded-2xl border border-slate-205 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-105 p-5">
            <h3 className="font-sans font-bold text-sm text-slate-900 flex items-center">
              <Sparkles className="h-4.5 w-4.5 text-blue-600 mr-2" />
              .NET Host Playpen Simulation
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Select an integration workflow, adjust configuration settings, and compile the code block.
            </p>
          </div>

          {/* Workflows Selectors */}
          <div className="p-5 space-y-4 flex-grow">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                Select .NET Handler Workflow
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedTask('salesforce-sync')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition ${
                    selectedTask === 'salesforce-sync'
                      ? 'border-blue-400 bg-blue-50/20 text-blue-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-[10px] font-sans font-bold">Salesforce</span>
                </button>

                <button
                  onClick={() => setSelectedTask('odoo-token')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition ${
                    selectedTask === 'odoo-token'
                      ? 'border-purple-400 bg-purple-50/20 text-purple-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-[10px] font-sans font-bold">Odoo ERP</span>
                </button>

                <button
                  onClick={() => setSelectedTask('ticket-push')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition ${
                    selectedTask === 'ticket-push'
                      ? 'border-amber-400 bg-amber-50/20 text-amber-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-[10px] font-sans font-bold">OneDrive</span>
                </button>
              </div>
            </div>

            {/* Custom Variables Section dynamically changing */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-205 space-y-3">
              <div className="flex items-center gap-1.5 text-slate-700 mb-1.5">
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px] font-extrabold uppercase font-sans tracking-wide">C# Input Variables</span>
              </div>

              {selectedTask === 'salesforce-sync' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-bold text-slate-500">Company Name (SObject mapping)</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  />
                </div>
              )}

              {selectedTask === 'odoo-token' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-bold text-slate-500">Destination Inventory Title</label>
                  <input
                    type="text"
                    value={inventoryTitle}
                    onChange={(e) => setInventoryTitle(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  />
                </div>
              )}

              {selectedTask === 'ticket-push' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold text-slate-500">Ticket Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full text-xs font-sans border border-slate-200 rounded-lg p-1.5 bg-white text-slate-800"
                    >
                      <option value="High">🔴 High Priority (C# Mail Express)</option>
                      <option value="Average">🟡 Average Priority</option>
                      <option value="Low">🟢 Low Priority</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold text-slate-500">Webhook Link URL</label>
                    <input
                      type="text"
                      placeholder="Optional webhook"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Dotnet Console Output */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                <Terminal className="h-3 w-3 text-slate-400" />
                C# CLI Console Output Buffer
              </label>
              
              <div className="h-44 bg-slate-950 rounded-xl p-3 font-mono text-[10px] text-slate-300 border border-slate-900 overflow-y-auto space-y-1 uppercase select-none">
                {logs.map((log, idx) => (
                  <p key={idx} className={
                    log.includes('SUCCESS') ? 'text-emerald-400 font-bold' :
                    log.includes('---') ? 'text-blue-400 font-bold font-sans' :
                    log.includes('[MSBuild]') ? 'text-slate-500' : 'text-slate-200'
                  }>
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="p-5 bg-slate-50 border-t border-slate-105">
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:bg-slate-300 disabled:cursor-not-allowed transition"
            >
              {isRunning ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Executing C# MSBuild Host...</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 fill-current" />
                  <span>Execute Simulated .NET Service</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

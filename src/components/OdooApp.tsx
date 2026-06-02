import React, { useState, useEffect } from 'react';
import { 
  Layers, Package, Check, Clipboard, CloudDownload, Tag, AlertCircle, Sparkles, TrendingUp, Cpu, Play
} from "lucide-react";
import { OdooInventory, InventoryField } from "../types";

export default function OdooApp() {
  const [odooInventories, setOdooInventories] = useState<OdooInventory[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [apiTokenInput, setApiTokenInput] = useState('');
  const [loadingImport, setLoadingImport] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  // Optional Create & Export back state
  const [showExportForm, setShowExportForm] = useState(false);
  const [exportTitle, setExportTitle] = useState('Odoo Procurement Batch');
  const [exportFields, setExportFields] = useState<InventoryField[]>([
    { name: "Odoo Stock Unit", type: "number" },
    { name: "Supplier Code", type: "text" }
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'number' | 'text'>('number');
  const [exportQuantity, setExportQuantity] = useState('500');

  useEffect(() => {
    fetchOdooInventories();
  }, []);

  const fetchOdooInventories = async () => {
    try {
      const res = await fetch('/api/odoo/inventories');
      const data = await res.json();
      setOdooInventories(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportByToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiTokenInput.trim()) return;

    setLoadingImport(true);
    setImportError('');
    setImportSuccess('');

    try {
      const res = await fetch('/api/odoo/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiToken: apiTokenInput.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Import rejected by token firewall.");
      }

      setOdooInventories(prev => {
        const existingIdx = prev.findIndex(item => item.inventoryTitle === data.inventoryTitle);
        if (existingIdx !== -1) {
          const dup = [...prev];
          dup[existingIdx] = data;
          return dup;
        }
        return [...prev, data];
      });

      setSelectedId(data.id);
      setApiTokenInput('');
      setImportSuccess(`Import completed! Odoo SObject metadata populated for '${data.inventoryTitle}'.`);

    } catch (err: any) {
      setImportError(err.message);
    } finally {
      setLoadingImport(false);
    }
  };

  // Create & Export to core app
  const handleCreateAndExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportTitle.trim()) return;

    try {
      const parsedQty = parseFloat(exportQuantity) || 120;
      const itemsPayload = [
        { [exportFields[0].name]: parsedQty, [exportFields[1].name]: "ODOO_PRO_89A" },
        { [exportFields[0].name]: parsedQty + 150, [exportFields[1].name]: "ODOO_PRO_12B" }
      ];

      const res = await fetch('/api/odoo/create-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: exportTitle,
          fields: exportFields,
          items: itemsPayload
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Export rejected");

      // Now import it immediately into Odoo!
      const autoImportResponse = await fetch('/api/odoo/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiToken: data.apiToken })
      });

      const autoImportData = await autoImportResponse.json();
      setOdooInventories(prev => [...prev, autoImportData]);
      setSelectedId(autoImportData.id);

      setExportTitle('Odoo Procurement Batch');
      setExportFields([
        { name: "Odoo Stock Unit", type: "number" },
        { name: "Supplier Code", type: "text" }
      ]);
      setShowExportForm(false);
      setImportSuccess(`Success! Item created in Odoo, exported to Core App, and synced back to Odoo. Token: ${data.apiToken}`);
    } catch (err: any) {
      setImportError(err.message);
    }
  };

  const addExportField = () => {
    if (!newFieldName.trim()) return;
    if (exportFields.some(f => f.name.toLowerCase() === newFieldName.toLowerCase())) return;
    setExportFields([...exportFields, { name: newFieldName.trim(), type: newFieldType }]);
    setNewFieldName('');
  };

  const activeOdooItem = odooInventories.find(item => item.id === selectedId);

  return (
    <div className="space-y-6" id="odoo-app-container">
      {/* Odoo ERP Custom Header bar */}
      <div className="bg-[#714B67] text-white px-6 py-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg text-[#714B67]">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg leading-tight">Odoo Enterprise ERP Module</h1>
            <p className="text-xs text-[#E1D3DC]/90 font-sans">Read-only synchronized data-analyser and scheduler client hub.</p>
          </div>
        </div>

        <div className="mt-3 md:mt-0 flex space-x-2">
          <button
            onClick={() => setShowExportForm(!showExportForm)}
            className="px-4 py-2 bg-[#8C6081] hover:bg-[#9E7294] text-xs font-semibold rounded-lg font-sans border border-[#966B8B] transition flex items-center space-x-1"
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1" />
            <span>Create & Export to Portfolio</span>
          </button>
        </div>
      </div>

      {/* Import actions and quick alerts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Token Importer Card */}
        <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <h3 className="font-sans font-bold text-sm text-zinc-900 mb-3 flex items-center">
            <CloudDownload className="h-4.5 w-4.5 text-[#714B67] mr-1.5" />
            Import by API Token
          </h3>
          <p className="text-xs text-zinc-500 mb-4 font-sans leading-relaxed">
            Specify the token generated inside your Course Inventor storage profile. Odoo will call your secure API port and import the telemetry schemas.
          </p>

          <form onSubmit={handleImportByToken} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-mono font-semibold uppercase text-zinc-400 mb-1">
                Course project API Token
              </label>
              <input
                type="text"
                required
                placeholder="e.g., tok_elem_918237"
                value={apiTokenInput}
                onChange={(e) => setApiTokenInput(e.target.value)}
                className="w-full text-xs font-mono font-bold text-zinc-950 border border-zinc-200 rounded-lg px-3 py-2 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loadingImport || !apiTokenInput.trim()}
              className="w-full py-2 bg-[#714B67] hover:bg-[#603C56] disabled:opacity-40 select-none text-white rounded-lg text-xs font-semibold font-sans transition flex items-center justify-center space-x-2"
            >
              {loadingImport && <Cpu className="h-3.5 w-3.5 animate-spin" />}
              <span>{loadingImport ? "Syncing API schemas..." : "Sync & Import"}</span>
            </button>
          </form>

          {importSuccess && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-100 flex items-start animate-fade-in">
              <Check className="h-4 w-4 mr-1.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="font-sans font-medium">{importSuccess}</span>
            </div>
          )}

          {importError && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 text-red-800 text-xs border border-red-100 flex items-start animate-fade-in">
              <AlertCircle className="h-4 w-4 mr-1.5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="font-sans font-medium">{importError}</span>
            </div>
          )}
        </div>

        {/* Imported items List panel */}
        <div className="md:col-span-8 bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <h3 className="font-sans font-bold text-sm text-zinc-900 mb-4 flex items-center">
            <Package className="h-4.5 w-4.5 text-zinc-400 mr-2" />
            Odoo ERP Database (Imported Records Explorer)
          </h3>

          {odooInventories.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 font-sans text-xs border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
              No inventories imported. Copy an API token from the "Course Inventories" tab and paste it in the Odoo Import tool on your left.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {odooInventories.map(item => {
                const isActive = item.id === selectedId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group h-32 ${
                      isActive 
                        ? 'bg-[#714B67]/5 border-[#714B67] ring-1 ring-[#714B67]' 
                        : 'bg-white border-zinc-200 hover:bg-zinc-50/50'
                    }`}
                  >
                    <div>
                      <h4 className="font-sans font-bold text-xs text-zinc-950 group-hover:text-[#714B67] truncate">
                        {item.inventoryTitle}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-sans mt-0.5 font-bold">
                        {item.fields.length} schema fields loaded
                      </p>
                    </div>

                    <div className="pt-2 border-t border-dotted border-zinc-200 flex justify-between items-center text-[9px] font-mono text-zinc-500">
                      <span>Imported</span>
                      <span className="truncate max-w-[80px]">
                        {new Date(item.importedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Odoo Detail cards */}
      {activeOdooItem && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden" id="odoo-record-viewer">
          <div className="bg-zinc-50 border-b border-zinc-150 px-5 py-4 flex justify-between items-center">
            <div>
              <span className="text-[9px] font-mono font-bold bg-[#714B67]/15 text-[#714B67] border border-[#714B67]/30 px-2.5 py-0.5 rounded uppercase">
                ODOO RECORD SCHEMA: READ-ONLY VIEWER
              </span>
              <h2 className="font-sans font-bold text-base text-zinc-900 mt-1">
                {activeOdooItem.inventoryTitle}
              </h2>
            </div>

            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-xs animate-ping" title="Channel Synced Live"></div>
          </div>

          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-[#714B67]/5 text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  <tr>
                    <th className="px-5 py-2.5 font-semibold">Odoo Database Column Name</th>
                    <th className="px-5 py-2.5 font-semibold">Schema Field Type</th>
                    <th className="px-5 py-2.5 font-semibold">Aggregated Analytics Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 font-sans">
                  {activeOdooItem.aggregates.map((agg, idx) => {
                    const isNumber = agg.type === 'number';
                    return (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="px-5 py-4 font-bold text-zinc-900 flex items-center">
                          <Tag className="h-3 w-3 mr-2 text-[#714B67]" />
                          {agg.fieldName}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] font-mono uppercase bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-zinc-500 font-bold">
                            {agg.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {isNumber ? (
                            <div className="flex bg-zinc-55 hover:bg-zinc-100 border border-zinc-200 rounded-xl p-2 max-w-sm space-x-4">
                              <div className="flex-1 text-center border-r border-zinc-200 pr-2">
                                <span className="text-[9px] text-zinc-400 block uppercase font-mono tracking-wider">Average</span>
                                <span className="font-mono font-bold text-medium text-zinc-900">{agg.average || 0}</span>
                              </div>
                              <div className="flex-1 text-center border-r border-zinc-200 pr-2">
                                <span className="text-[9px] text-zinc-400 block uppercase font-mono tracking-wider">Min</span>
                                <span className="font-mono font-bold text-medium text-zinc-700">{agg.min ?? 0}</span>
                              </div>
                              <div className="flex-1 text-center">
                                <span className="text-[9px] text-zinc-400 block uppercase font-mono tracking-wider">Max</span>
                                <span className="font-mono font-bold text-medium text-zinc-700">{agg.max ?? 0}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {agg.popularValues && agg.popularValues.length > 0 ? (
                                agg.popularValues.map((val, vIdx) => (
                                  <span key={vIdx} className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded-md text-xs font-semibold">
                                    {val}
                                  </span>
                                ))
                              ) : (
                                <span className="text-zinc-400 italic">No field inputs</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* API Audit logs for Odoo submission */}
            <div className="mt-6 pt-5 border-t border-zinc-150 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-zinc-400 font-mono">
              <div className="mb-2 sm:mb-0">
                <span>API Channel Token: </span>
                <span className="font-bold text-zinc-700 select-all">{activeOdooItem.apiTokenUsed}</span>
              </div>

              <div>
                <span>Last Updated Code Index: </span>
                <span className="text-[#714B67] bg-[#714B67]/10 px-2 py-0.5 rounded font-bold">LIVE METRIC PULL SYNCRONIZED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Odoo Optional: Setup and export back form popup dialog */}
      {showExportForm && (
        <div className="fixed inset-0 bg-transparent flex justify-center items-center z-55 bg-zinc-950/65 backdrop-blur-xs" id="odoo-export-creator">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-xl p-6 mx-4 relative max-h-[95vh] overflow-y-auto">
            <h3 className="font-sans font-bold text-base text-[#714B67] mb-1">
              Odoo: Create Inventory & Export to Portfolio App
            </h3>
            <p className="text-xs text-zinc-500 font-sans mb-5 leading-tight">
              An advanced integration capability to trigger new warehousing records originating inside Odoo ERP database, compiled, and dispatched backward to the core Portfolio applet.
            </p>

            <form onSubmit={handleCreateAndExport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                  New Inventory Title (Dispatched from Odoo) *
                </label>
                <input
                  type="text"
                  required
                  value={exportTitle}
                  onChange={(e) => setExportTitle(e.target.value)}
                  className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                  Default Core Quantity Input *
                </label>
                <input
                  type="number"
                  required
                  value={exportQuantity}
                  onChange={(e) => setExportQuantity(e.target.value)}
                  className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2 bg-white"
                />
              </div>

              {/* Dynamic properties */}
              <div className="border border-zinc-150 p-4 rounded-xl bg-zinc-50/50">
                <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider font-bold block mb-2">Column Schemas to Export</span>
                
                <div className="space-y-2 mb-3 max-h-[100px] overflow-y-auto">
                  {exportFields.map((f, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white border border-zinc-200 px-3 py-1.5 rounded-lg">
                      <span className="text-xs font-sans font-medium text-zinc-800">{f.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-zinc-100 uppercase border border-zinc-200 text-zinc-500">
                        {f.type}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="New column title"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    className="flex-1 text-xs font-sans border border-zinc-200 rounded-lg px-3 bg-white h-8"
                  />
                  <select
                    value={newFieldType}
                    onChange={(e: any) => setNewFieldType(e.target.value)}
                    className="text-xs font-sans border border-zinc-200 rounded-lg bg-white px-2 h-8"
                  >
                    <option value="number">Number</option>
                    <option value="text">Text</option>
                  </select>
                  <button
                    type="button"
                    onClick={addExportField}
                    className="px-3 bg-zinc-900 text-white rounded-lg text-xs font-bold font-sans hover:bg-zinc-850 h-8 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowExportForm(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 bg-white rounded-lg text-xs font-semibold font-sans hover:bg-zinc-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#714B67] hover:bg-[#603C56] text-white rounded-lg text-xs font-semibold font-sans transition flex items-center"
                >
                  <Play className="h-3 w-3 mr-1.5" />
                  Compile & Dispatch backward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

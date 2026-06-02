import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Key, Link2, Copy, FileSpreadsheet, RotateCw, CheckCircle, AlertCircle, Sparkles, HelpCircle 
} from "lucide-react";
import { Inventory, InventoryField, InventoryItem } from "../types";

interface InventoryManagerProps {
  onInventorySelected?: (title: string) => void;
}

export default function InventoryManager({ onInventorySelected }: InventoryManagerProps) {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  // Inventory Creation Fields
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFields, setNewFields] = useState<InventoryField[]>([
    { name: "Quantity", type: "number" },
    { name: "Supplier Country", type: "text" }
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Row Input Item Editing States
  const [tempRow, setTempRow] = useState<Record<string, string>>({});
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  // Field Addition State
  const [fieldNameInput, setFieldNameInput] = useState('');
  const [fieldTypeInput, setFieldTypeInput] = useState<'number' | 'text'>('number');

  // Copy success indicator
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  useEffect(() => {
    fetchInventories();
  }, []);

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventories');
      if (!res.ok) throw new Error("Failed to fetch inventories");
      const data = await res.json();
      setInventories(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
        if (onInventorySelected) onInventorySelected(data[0].title);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const activeInv = inventories.find(i => i.id === selectedId);

  // Clear success notification
  const triggerSuccessMsg = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // Generate / Rotate token
  const handleRotateToken = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/inventories/${id}/token`, { method: 'POST' });
      if (!res.ok) throw new Error("Failed to rotate token");
      const data = await res.json();
      setInventories(prev => prev.map(inv => inv.id === id ? { ...inv, apiToken: data.apiToken } : inv));
      triggerSuccessMsg("REST API secure token rotated successfully!");
    } catch (err: any) {
      setError("Token action failed: " + err.message);
    }
  };

  // Create Inventory
  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/inventories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          fields: newFields
        })
      });
      if (!res.ok) throw new Error("Failed to save new storage domain");
      const saved = await res.json();
      setInventories(prev => [...prev, saved]);
      setSelectedId(saved.id);
      if (onInventorySelected) onInventorySelected(saved.title);
      
      // Reset State
      setNewTitle('');
      setNewDesc('');
      setNewFields([
        { name: "Quantity", type: "number" },
        { name: "Supplier Country", type: "text" }
      ]);
      setShowCreateModal(false);
      triggerSuccessMsg(`Inventory '${saved.title}' initialized with Odoo compatibility.`);
    } catch (err: any) {
      setError("Failed to create inventory: " + err.message);
    }
  };

  // Add field to new creation blueprint
  const appendCreationField = () => {
    if (!fieldNameInput.trim()) return;
    if (newFields.some(f => f.name.toLowerCase() === fieldNameInput.toLowerCase())) {
      alert("Field with this name already exists");
      return;
    }
    setNewFields(prev => [...prev, { name: fieldNameInput.trim(), type: fieldTypeInput }]);
    setFieldNameInput('');
  };

  // Add a field dynamically to an ALREADY existing inventory schema
  const handleAddNewFieldToActive = async () => {
    if (!activeInv || !fieldNameInput.trim()) return;
    if (activeInv.fields.some(f => f.name.toLowerCase() === fieldNameInput.toLowerCase())) {
      alert("Field with this name already exists in this inventory!");
      return;
    }

    const updatedFields = [...activeInv.fields, { name: fieldNameInput.trim(), type: fieldTypeInput }];
    
    // Add default values to existing rows
    const updatedItems = activeInv.items.map(item => ({
      ...item,
      [fieldNameInput.trim()]: fieldTypeInput === 'number' ? 0 : ''
    }));

    try {
      const res = await fetch(`/api/inventories/${activeInv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: updatedFields, items: updatedItems })
      });
      if (!res.ok) throw new Error("Failed to save schema update");
      const updatedData = await res.json();
      setInventories(prev => prev.map(inv => inv.id === activeInv.id ? updatedData : inv));
      setFieldNameInput('');
      triggerSuccessMsg(`Property '${fieldNameInput}' appended to standard schema.`);
    } catch (err: any) {
      setError("Schema amendment failed: " + err.message);
    }
  };

  // Delete inventory
  const handleDeleteInventory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the inventory '${name}'?`)) return;
    try {
      const res = await fetch(`/api/inventories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to remove data storage record");
      
      const filtered = inventories.filter(inv => inv.id !== id);
      setInventories(filtered);
      if (filtered.length > 0) {
        setSelectedId(filtered[0].id);
        if (onInventorySelected) onInventorySelected(filtered[0].title);
      } else {
        setSelectedId('');
      }
      triggerSuccessMsg(`Inventory ${name} removed safely.`);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Save Inventory Row Item
  const handleSaveRowItem = async (index: number | null) => {
    if (!activeInv) return;

    let updatedItems = [...activeInv.items];
    const rowPayload: InventoryItem = {};

    activeInv.fields.forEach(f => {
      const inputVal = tempRow[f.name];
      if (f.type === 'number') {
        const parsed = parseFloat(inputVal);
        rowPayload[f.name] = isNaN(parsed) ? 0 : parsed;
      } else {
        rowPayload[f.name] = inputVal || '';
      }
    });

    if (index === null) {
      // Append new
      updatedItems.push(rowPayload);
    } else {
      // edit existing
      updatedItems[index] = rowPayload;
    }

    try {
      const res = await fetch(`/api/inventories/${activeInv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      });
      if (!res.ok) throw new Error("Failed to sync row edits to server");
      const updatedData = await res.json();
      setInventories(prev => prev.map(inv => inv.id === activeInv.id ? { ...inv, items: updatedData.items } : inv));
      
      setTempRow({});
      setEditingRowIndex(null);
      triggerSuccessMsg("Inventory record synchronized. Aggregated data recalculated.");
    } catch (err: any) {
      setError("Row update failed: " + err.message);
    }
  };

  // Delete individual row
  const handleDeleteRow = async (rowIndex: number) => {
    if (!activeInv) return;
    const updatedItems = activeInv.items.filter((_, idx) => idx !== rowIndex);

    try {
      const res = await fetch(`/api/inventories/${activeInv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      });
      if (!res.ok) throw new Error("Failed to delete record from server");
      setInventories(prev => prev.map(inv => inv.id === activeInv.id ? { ...inv, items: updatedItems } : inv));
      triggerSuccessMsg("Record deleted. Aggregated analytics adjusted instantly.");
    } catch (err: any) {
      setError("Delete failed: " + err.message);
    }
  };

  // Clipboard copy helper
  const handleCopyText = (text: string, ind: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIndex(ind);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  // Computed local aggregation metrics helper
  const computeLocalAggregates = () => {
    if (!activeInv) return [];
    
    return activeInv.fields.map(field => {
      const values = activeInv.items.map(item => item[field.name]).filter(val => val !== undefined && val !== null);
      
      if (field.type === 'number') {
        const numVals = values.map(v => typeof v === 'string' ? parseFloat(v) : v).filter(v => !isNaN(v));
        if (numVals.length === 0) {
          return { fieldName: field.name, type: 'number', average: 0, min: 0, max: 0 };
        }
        const sum = numVals.reduce((a, b) => a + b, 0);
        const average = Math.round((sum / numVals.length) * 100) / 100;
        const min = Math.min(...numVals);
        const max = Math.max(...numVals);
        return { fieldName: field.name, type: 'number', average, min, max };
      } else {
        const strVals = values.map(v => String(v).trim()).filter(v => v.length > 0);
        const frequencies: Record<string, number> = {};
        for (const val of strVals) {
          frequencies[val] = (frequencies[val] || 0) + 1;
        }
        const sortedFreqs = Object.entries(frequencies)
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([val, freq]) => `${val} (${freq}x)`);
        
        return { fieldName: field.name, type: 'text', popularValues: sortedFreqs.slice(0, 3) };
      }
    });
  };

  const currentLocalAggregates = computeLocalAggregates();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="inv-dashboard-layout">
      {/* Sidebar: Inventories List Selection */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-sans font-bold text-base text-zinc-900 tracking-tight flex items-center">
              <FileSpreadsheet className="h-5 w-5 text-zinc-500 mr-2" />
              Course Inventories
            </h2>
            <button
              id="btn-trigger-create-modal"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-3 py-1.5 text-xs font-sans font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New
            </button>
          </div>

          {loading ? (
            <div className="space-y-3 py-6" id="shimmer-loading">
              <div className="h-10 bg-zinc-100 rounded-sm animate-pulse"></div>
              <div className="h-10 bg-zinc-100 rounded-sm animate-pulse"></div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : inventories.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-sm">
              No inventories found. Add your first to integrate with Odoo!
            </div>
          ) : (
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1" id="inv-items-scroller">
              {inventories.map(inv => {
                const isActive = inv.id === selectedId;
                return (
                  <div
                    key={inv.id}
                    id={`inv-card-${inv.id}`}
                    onClick={() => {
                      setSelectedId(inv.id);
                      if (onInventorySelected) onInventorySelected(inv.title);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isActive 
                        ? 'bg-zinc-50 border-zinc-950 ring-1 ring-zinc-950' 
                        : 'bg-white border-zinc-200 hover:bg-zinc-50/50 hover:border-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-sans font-semibold text-sm text-zinc-900 leading-tight">
                          {inv.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteInventory(inv.id, inv.title);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition"
                          title="Delete inventory"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="font-sans text-xs text-zinc-500 mt-1 line-clamp-2">
                        {inv.description || "No description provided."}
                      </p>
                    </div>

                    {/* Metadata indicators */}
                    <div className="mt-3 pt-3 border-t border-dotted border-zinc-200 flex justify-between items-center text-[11px] font-mono">
                      <span className="text-zinc-500">
                        {inv.items.length} {inv.items.length === 1 ? 'row' : 'rows'}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-zinc-400 flex items-center">
                          <Key className="h-2.5 w-2.5 mr-1 text-zinc-400" />
                          {inv.apiToken.substring(0, 8)}...
                        </span>
                        <button 
                          onClick={(e) => handleRotateToken(inv.id, e)}
                          className="text-zinc-400 hover:text-zinc-900 p-0.5 rounded hover:bg-zinc-100 transition"
                          title="Rotate secure token"
                        >
                          <RotateCw className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Schema Adding Panel (ONLY for active item) */}
        {activeInv && (
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs" id="schema-panel">
            <h3 className="font-sans font-bold text-sm text-zinc-900 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 text-emerald-500 mr-1.5" />
              Dynamic Schema Customization
            </h3>
            <p className="text-xs text-zinc-500 mb-4 font-sans max-w-full leading-relaxed">
              Inject custom parameters dynamically. New cells will align to all rows instantly and are exposed to the Odoo ERP exporter scheme.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Parameter Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Storage Temp, Color, Shelf Life"
                  value={fieldNameInput}
                  onChange={(e) => setFieldNameInput(e.target.value)}
                  className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Data Property Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFieldTypeInput('number')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border font-sans ${
                      fieldTypeInput === 'number'
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-300 shadow-xs'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50/50'
                    }`}
                  >
                    Numerical (Min/Max/Avg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFieldTypeInput('text')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border font-sans ${
                      fieldTypeInput === 'text'
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-300 shadow-xs'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50/50'
                    }`}
                  >
                    Textal (Frequency list)
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddNewFieldToActive}
                disabled={!fieldNameInput.trim()}
                className="w-full py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium font-sans hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Inject Property to Schema
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area: Tabular Records & Aggregation Panels */}
      <div className="lg:col-span-8 space-y-6">
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-100 flex items-center shadow-xs animate-fade-in" id="action-success-bar">
            <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
            <span className="font-sans font-medium">{actionSuccess}</span>
          </div>
        )}

        {activeInv ? (
          <div className="space-y-6" id="active-management-viewport">
            {/* 1. Header with Export Keys and API URL */}
            <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-sm border border-zinc-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded tracking-wider">
                    DATABASE INVENTORY blueprint
                  </span>
                  <h1 className="font-sans font-bold text-xl text-white tracking-tight mt-1.5">
                    {activeInv.title}
                  </h1>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-xl flex items-center space-x-3 w-full sm:w-auto">
                  <Key className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                  <div className="truncate pr-4">
                    <p className="text-[9px] font-mono uppercase text-zinc-500 font-bold tracking-widest">
                      Odoo Secure Sync Token
                    </p>
                    <p className="text-xs font-mono text-zinc-200 truncate max-w-[200px]">
                      {activeInv.apiToken}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyText(activeInv.apiToken, 'token')}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                    title="Copy API Token"
                  >
                    {copiedIndex === 'token' ? (
                      <span className="text-xs text-emerald-400 font-sans font-semibold">Copied!</span>
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Endpoint visual links section for homework validation */}
              <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-3 text-xs font-sans text-zinc-400 leading-tight">
                  <span className="font-bold text-zinc-300 block">External API Endpoint:</span>
                  Allows Odoo read-only viewer to harvest metrics.
                </div>
                <div className="md:col-span-9 flex bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 p-1">
                  <span className="bg-emerald-600/10 text-emerald-400 text-[10px] font-mono px-2 py-1.5 rounded font-bold uppercase tracking-wider h-full flex items-center self-center mr-1">
                    GET
                  </span>
                  <div className="flex-1 truncate font-mono text-xs text-zinc-300 py-1.5 px-2 self-center select-all">
                    {`http://localhost:3000/api/external/inventory-export?token=${activeInv.apiToken}`}
                  </div>
                  <button
                    onClick={() => handleCopyText(`http://localhost:3000/api/external/inventory-export?token=${activeInv.apiToken}`, 'endpoint')}
                    className="bg-zinc-800 hover:bg-zinc-700 transition px-3 py-1.5 rounded-lg text-zinc-300 font-sans text-xs font-semibold flex items-center space-x-1"
                  >
                    <Link2 className="h-3 w-3 mr-1" />
                    <span>{copiedIndex === 'endpoint' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Real-Time Dynamic Analytics Panel / Aggregates */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs" id="aggregations-monitor">
              <h3 className="font-sans font-bold text-sm text-zinc-900 mb-4 flex items-center">
                <Sparkles className="h-4 w-4 text-amber-500 mr-2" />
                Real-Time Recalculated Analytics (Export Schema)
              </h3>

              {currentLocalAggregates.length === 0 ? (
                <p className="text-zinc-400 text-xs font-sans">No descriptors structured in this schema.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {currentLocalAggregates.map((agg, idx) => {
                    const isNumber = agg.type === 'number';
                    return (
                      <div key={idx} className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[11px] font-sans font-bold text-zinc-900 break-words line-clamp-1">
                              {agg.fieldName}
                            </span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold bg-zinc-200 border border-zinc-350 text-zinc-600">
                              {agg.type}
                            </span>
                          </div>

                          {isNumber ? (
                            <div className="space-y-1.5 mt-2">
                              <div className="flex justify-between text-xs font-sans border-b border-zinc-150 pb-1">
                                <span className="text-zinc-500">Average:</span>
                                <span className="font-bold text-zinc-800 font-mono">{agg.average}</span>
                              </div>
                              <div className="flex justify-between text-[11px] font-sans text-zinc-500 pt-0.5">
                                <span>Min / Max:</span>
                                <span className="font-mono text-zinc-700">
                                  {agg.min} / {agg.max}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 mt-2">
                              <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">Top 3 Values:</span>
                              {agg.popularValues && agg.popularValues.length > 0 ? (
                                <ul className="space-y-1">
                                  {agg.popularValues.map((val, vIdx) => (
                                    <li key={vIdx} className="text-xs font-sans font-medium text-zinc-800 truncate" title={val}>
                                      • {val}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-[11px] text-zinc-400 italic">No entries yet</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Tabular Entries / Datatable Edit Zone */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden" id="inventory-tabular-editor">
              <div className="bg-zinc-50/50 px-5 py-4 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div>
                  <h3 className="font-sans font-bold text-sm text-zinc-900">
                    Row Records Database Table
                  </h3>
                  <p className="text-xs text-zinc-500 font-sans tracking-tight">
                    Add or modify stock items. These adjust calculations automatically.
                  </p>
                </div>
                {editingRowIndex === null && (
                  <button
                    onClick={() => {
                      // Init clean row fields
                      const clean: Record<string, string> = {};
                      activeInv.fields.forEach(f => {
                        clean[f.name] = f.type === 'number' ? '0' : '';
                      });
                      setTempRow(clean);
                      setEditingRowIndex(-1); // represents brand new row in editing state
                    }}
                    className="flex items-center px-3 py-1.5 text-xs font-sans font-semibold bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 transition text-white rounded-lg"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Insert Record Row
                  </button>
                )}
              </div>

              {/* Editable Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-zinc-700">
                  <thead className="bg-zinc-50 border-b border-zinc-200 font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Row Index</th>
                      {activeInv.fields.map((f, fIdx) => (
                        <th key={fIdx} className="px-5 py-3 font-semibold">{f.name}</th>
                      ))}
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 font-sans">
                    {/* Add Brand New Inline Row Input */}
                    {editingRowIndex === -1 && (
                      <tr className="bg-amber-50/40 border-b border-amber-100" id="brand-new-row-inputs">
                        <td className="px-5 py-3.5 font-mono font-bold text-zinc-500 text-xs">
                          NEW
                        </td>
                        {activeInv.fields.map((f, idx) => (
                          <td key={idx} className="px-5 py-2">
                            <input
                              type={f.type === 'number' ? 'number' : 'text'}
                              value={tempRow[f.name] || ''}
                              onChange={(e) => setTempRow({ ...tempRow, [f.name]: e.target.value })}
                              className="w-full text-xs font-sans border border-zinc-300 rounded-md px-2.5 py-1 bg-white focus:outline-hidden focus:ring-1 focus:ring-zinc-950"
                              placeholder={f.type === 'number' ? '0' : 'Type here...'}
                            />
                          </td>
                        ))}
                        <td className="px-5 py-2 text-right space-x-2">
                          <button
                            onClick={() => handleSaveRowItem(null)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold font-sans px-2.5 py-1 rounded text-[11px] h-7"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingRowIndex(null);
                              setTempRow({});
                            }}
                            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-semibold font-sans px-2.5 py-1 rounded text-[11px] h-7"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    )}

                    {activeInv.items.length === 0 && editingRowIndex !== -1 ? (
                      <tr>
                        <td colSpan={activeInv.fields.length + 2} className="px-5 py-8 text-center text-zinc-400 font-sans italic">
                          No items loaded in this warehouse registry. Click "Insert Record Row" to demonstrate.
                        </td>
                      </tr>
                    ) : (
                      activeInv.items.map((item, rIdx) => {
                        const isEditingThis = editingRowIndex === rIdx;
                        return (
                          <tr key={rIdx} className={isEditingThis ? 'bg-amber-50/45' : 'hover:bg-zinc-50/40'}>
                            <td className="px-5 py-3 font-mono font-medium text-zinc-400">
                              #{rIdx + 1}
                            </td>

                            {activeInv.fields.map((f, fIdx) => (
                              <td key={fIdx} className="px-5 py-3 text-zinc-900">
                                {isEditingThis ? (
                                  <input
                                    type={f.type === 'number' ? 'number' : 'text'}
                                    value={tempRow[f.name] || ''}
                                    onChange={(e) => setTempRow({ ...tempRow, [f.name]: e.target.value })}
                                    className="w-full text-xs font-sans border border-zinc-300 rounded-md px-2.5 py-1 bg-white focus:outline-hidden focus:ring-1 focus:ring-zinc-950"
                                  />
                                ) : (
                                  <span className={f.type === 'number' ? 'font-mono' : ''}>
                                    {item[f.name] !== undefined ? String(item[f.name]) : '-'}
                                  </span>
                                )}
                              </td>
                            ))}

                            <td className="px-5 py-3 text-right space-x-1">
                              {isEditingThis ? (
                                <>
                                  <button
                                    onClick={() => handleSaveRowItem(rIdx)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold font-sans px-2.5 py-1 rounded text-[11px]"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingRowIndex(null);
                                      setTempRow({});
                                    }}
                                    className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-semibold font-sans px-2.5 py-1 rounded text-[11px]"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      // populate row inputs
                                      const mapped: Record<string, string> = {};
                                      activeInv.fields.forEach(f => {
                                        mapped[f.name] = String(item[f.name] !== undefined ? item[f.name] : '');
                                      });
                                      setTempRow(mapped);
                                      setEditingRowIndex(rIdx);
                                    }}
                                    className="text-zinc-600 hover:text-zinc-900 font-sans font-semibold px-2 py-1 rounded hover:bg-zinc-150 transition"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRow(rIdx)}
                                    className="text-red-500 hover:text-red-700 font-sans font-semibold px-2 py-1 rounded hover:bg-red-50 transition"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 text-center border border-zinc-200 rounded-2xl text-zinc-500 font-sans">
            Please initialize or select a warehouse inventory.
          </div>
        )}
      </div>

      {/* Slide-over Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent flex justify-center items-center z-55 bg-zinc-950/65 backdrop-blur-xs" id="create-modal-layout">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-xl p-6 mx-4 relative">
            <h3 className="font-sans font-bold text-lg text-zinc-900 mb-2">Create New Warehousing Inventory</h3>
            <p className="text-xs text-zinc-500 font-sans mb-4">
              Draft the core description and properties list. These schemas translate directly into live analytical API triggers.
            </p>

            <form onSubmit={handleCreateInventory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                  Inventory Identifier Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Hardware, Pharmacy Chemical Logs"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 font-sans mb-1">
                  Purpose / Warehouse Description
                </label>
                <textarea
                  placeholder="Summarize storage specifications..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full text-xs font-sans border border-zinc-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
                />
              </div>

              {/* Field schemas creation list */}
              <div className="border border-zinc-150 p-4 rounded-xl bg-zinc-50/50">
                <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider font-bold block mb-2">Initial Parameter Blueprints</span>
                
                <div className="space-y-2 mb-3 max-h-[110px] overflow-y-auto">
                  {newFields.map((f, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white border border-zinc-200 px-3 py-1.5 rounded-lg">
                      <span className="text-xs font-sans font-medium text-zinc-800">{f.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-zinc-100 uppercase border border-zinc-200 text-zinc-500">
                          {f.type}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewFields(prev => prev.filter((_, i) => i !== idx))}
                          className="text-zinc-400 hover:text-red-600 p-0.5 rounded transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="New custom column title"
                    value={fieldNameInput}
                    onChange={(e) => setFieldNameInput(e.target.value)}
                    className="flex-1 text-xs font-sans border border-zinc-200 rounded-lg px-3 bg-white focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 h-8.5"
                  />
                  <select
                    value={fieldTypeInput}
                    onChange={(e: any) => setFieldTypeInput(e.target.value)}
                    className="text-xs font-sans border border-zinc-200 rounded-lg bg-white px-2 h-8.5"
                  >
                    <option value="number">Number</option>
                    <option value="text">Text</option>
                  </select>
                  <button
                    type="button"
                    onClick={appendCreationField}
                    className="px-3 bg-zinc-900 text-white rounded-lg text-xs font-bold font-sans hover:bg-zinc-850 h-8.5 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 bg-white rounded-lg text-xs font-semibold font-sans hover:bg-zinc-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 border border-zinc-850 text-white rounded-lg text-xs font-semibold font-sans hover:bg-zinc-800 transition"
                >
                  Setup Database Engine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

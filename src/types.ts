export interface InventoryField {
  name: string;
  type: 'number' | 'text';
}

export interface InventoryItem {
  [key: string]: string | number;
}

export interface Inventory {
  id: string;
  title: string;
  description: string;
  apiToken: string;
  fields: InventoryField[];
  items: InventoryItem[];
  createdAt: string;
}

export interface InventoryAggregate {
  fieldName: string;
  type: 'number' | 'text';
  // numeric aggregates
  average?: number;
  min?: number;
  max?: number;
  // text aggregates
  popularValues?: string[];
}

export interface InventoryExportResponse {
  inventoryTitle: string;
  fields: InventoryField[];
  aggregates: InventoryAggregate[];
}

export interface SalesforceConfig {
  instanceUrl: string;
  clientId: string;
  username: string;
  useDemo: boolean;
}

export interface SalesforceSyncRecord {
  id: string; // our internal id
  companyName: string;
  industry: string;
  billingStreet: string;
  billingCity: string;
  billingCountry: string;
  phone: string;
  annualRevenue: number;
  salesforceAccountId?: string;
  salesforceContactId?: string;
  syncedAt?: string;
  status: 'pending' | 'success' | 'failed';
  logs: string[];
}

export interface OdooInventory {
  id: string;
  inventoryTitle: string;
  fields: InventoryField[];
  aggregates: InventoryAggregate[];
  importedAt: string;
  apiTokenUsed: string;
}

export interface SupportTicket {
  id: string;
  summary: string;
  priority: 'High' | 'Average' | 'Low';
  reportedBy: string;
  inventoryTitle: string;
  link: string;
  adminEmails: string[];
  webhookUrl: string;
  status: 'draft' | 'uploaded' | 'failed';
  uploadedFileUrl?: string; // simulating Dropbox / OneDrive URL
  createdAt: string;
  logs: string[];
}

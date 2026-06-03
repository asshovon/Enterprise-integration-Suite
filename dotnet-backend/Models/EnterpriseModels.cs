using System;
using System.Collections.Generic;

namespace EnterpriseIntegrationWebAPI.Models
{
    public class CourseInventory
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string LastAggregate { get; set; } = string.Empty;
        public double MeanValue { get; set; }
        public string ApiAccess { get; set; } = string.Empty;
        public DateTime LastSynced { get; set; } = DateTime.UtcNow;
    }

    public class SalesforceSyncRecord
    {
        public string Id { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string SalesforceAccountId { get; set; } = string.Empty;
        public string SalesforceContactId { get; set; } = string.Empty;
        public string Status { get; set; } = "Linked";
        public DateTime SyncedAt { get; set; } = DateTime.UtcNow;
    }

    public class OdooInventory
    {
        public string Id { get; set; } = string.Empty;
        public string InventoryTitle { get; set; } = string.Empty;
        public string ApiTokenUsed { get; set; } = string.Empty;
        public List<string> Fields { get; set; } = new();
        public DateTime ImportedAt { get; set; } = DateTime.UtcNow;
    }

    public class SupportTicket
    {
        public string Id { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Priority { get; set; } = "Average";
        public string ReportedBy { get; set; } = "asshovon15@gmail.com";
        public string InventoryTitle { get; set; } = "N/A";
        public string Link { get; set; } = string.Empty;
        public List<string> AdminEmails { get; set; } = new();
        public string WebhookUrl { get; set; } = string.Empty;
        public string Status { get; set; } = "uploaded";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
    
    public class SimulationRequest
    {
        public string IntegrationType { get; set; } = "salesforce";
        public string CompanyName { get; set; } = string.Empty;
        public string Priority { get; set; } = "Average";
        public string Summary { get; set; } = string.Empty;
        public string InventoryTitle { get; set; } = "N/A";
        public string WebhookUrl { get; set; } = string.Empty;
    }
}

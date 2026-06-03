using Microsoft.AspNetCore.Mvc;
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
            new CourseInventory { Id = "inv_01", Title = "Warehouse Alpha Staging", LastAggregate = "Today, 09:12 AM", MeanValue = 14290.00, ApiAccess = "" },
            new CourseInventory { Id = "inv_02", Title = "Global Supply Assets", LastAggregate = "Yesterday, 14:00 PM", MeanValue = 8940.50, ApiAccess = "odoo_x92k_Lp2" }
        };

        private static readonly List<SalesforceSyncRecord> _sfLogs = new();
        private static readonly List<OdooInventory> _odooLogs = new();
        private static readonly List<SupportTicket> _tickets = new();

        private readonly IHttpClientFactory _httpClientFactory;

        public IntegrationController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet("inventories")]
        public ActionResult<IEnumerable<CourseInventory>> GetInventories()
        {
            return Ok(_inventories);
        }

        [HttpPost("salesforce/handshake")]
        public ActionResult<SalesforceSyncRecord> SalesforceHandshake([FromBody] SalesforceSyncRecord input)
        {
            if (string.IsNullOrWhiteSpace(input.CompanyName))
            {
                return BadRequest("Company name is required for Salesforce mapping.");
            }

            var random = new Random();
            var accountId = $"0018000000{random.Next(100000, 999999)}AQA";
            var contactId = $"0038000000{random.Next(100000, 999999)}ZQA";

            var log = new SalesforceSyncRecord
            {
                Id = Guid.NewGuid().ToString(),
                CompanyName = input.CompanyName,
                SalesforceAccountId = accountId,
                SalesforceContactId = contactId,
                Status = "Linked",
                SyncedAt = DateTime.UtcNow
            };

            _sfLogs.Insert(0, log);
            return Ok(log);
        }

        [HttpPost("odoo/token")]
        public ActionResult GenerateOdooToken([FromBody] JsonElement payload)
        {
            if (!payload.TryGetProperty("inventoryId", out var idProp))
            {
                return BadRequest("Inventory ID is required.");
            }

            var inventoryId = idProp.GetString();
            var target = _inventories.Find(x => x.Id == inventoryId);
            if (target == null)
            {
                return NotFound("Inventory item not found.");
            }

            var token = "odoo_" + Convert.ToBase64String(Encoding.UTF8.GetBytes(target.Title + DateTime.UtcNow.Ticks)).Substring(0, 12);
            target.ApiAccess = token;

            var log = new OdooInventory
            {
                Id = Guid.NewGuid().ToString(),
                InventoryTitle = target.Title,
                ApiTokenUsed = token,
                Fields = new List<string> { "item_code", "physical_qty", "allocated_val", "mean_unit_price" },
                ImportedAt = DateTime.UtcNow
            };

            _odooLogs.Insert(0, log);

            return Ok(new { token });
        }

        [HttpPost("tickets/submit")]
        public async Task<ActionResult<SupportTicket>> SubmitTicket([FromBody] SupportTicket ticketInput)
        {
            if (string.IsNullOrWhiteSpace(ticketInput.Summary))
            {
                return BadRequest("Ticket summary description is mandatory.");
            }

            var ticketId = "TKT_" + DateTime.UtcNow.Ticks.ToString().Substring(10);
            var status = "uploaded";
            
            var ticket = new SupportTicket
            {
                Id = ticketId,
                Summary = ticketInput.Summary,
                Priority = ticketInput.Priority ?? "Average",
                ReportedBy = ticketInput.ReportedBy ?? "asshovon15@gmail.com",
                InventoryTitle = ticketInput.InventoryTitle ?? "N/A",
                Link = ticketInput.Link ?? "http://localhost:3000/#/inventory",
                AdminEmails = ticketInput.AdminEmails ?? new List<string> { "asshovon15@gmail.com" },
                WebhookUrl = ticketInput.WebhookUrl ?? string.Empty,
                Status = status,
                CreatedAt = DateTime.UtcNow
            };

            // Simulating real Power Automate/OneDrive webhook payload dispatch in C#
            if (!string.IsNullOrWhiteSpace(ticket.WebhookUrl) && ticket.WebhookUrl.StartsWith("http"))
            {
                try
                {
                    var client = _httpClientFactory.CreateClient();
                    var payload = new
                    {
                        @class = "EnterpriseSupportTicket",
                        ticketId = ticket.Id,
                        summary = ticket.Summary,
                        priority = ticket.Priority,
                        reportedBy = ticket.ReportedBy,
                        timestamp = ticket.CreatedAt,
                        targetAdmins = ticket.AdminEmails
                    };

                    var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                    await client.PostAsync(ticket.WebhookUrl, content);
                }
                catch
                {
                    // Failed to dispatch to external webhook, update status
                    ticket.Status = "local-only";
                }
            }

            _tickets.Insert(0, ticket);
            return Ok(ticket);
        }
    }
}

using System.Net.Http.Headers;
using System.Runtime.InteropServices.JavaScript;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using RestaurantAPI.Controllers;
using RestaurantAPI.Data;
using RestaurantAPI.Enums;
using RestaurantAPI.Models;

namespace RestaurantAPI.Services;

public class PayUService(HttpClient httpClient, IConfiguration config, AppDbContext context) : IPayUService
{
    public async Task<string> CreatePaymentAsync(Order order)
{
    var baseUrl = config["PayU:BaseUrl"];
    var clientId = config["PayU:ClientId"];
    var clientSecret = config["PayU:ClientSecret"];
    var posId = config["PayU:PosId"];

    // 1. POBRANIE TOKENA
    var tokenDict = new Dictionary<string, string>
    {
        { "grant_type", "client_credentials" },
        { "client_id", clientId! },
        { "client_secret", clientSecret! }
    };

    var tokenRequest = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/pl/standard/user/oauth/authorize")
    {
        Content = new FormUrlEncodedContent(tokenDict)
    };

    var tokenResponse = await httpClient.SendAsync(tokenRequest);
    
    // Zabezpieczenie wypluwające czysty JSON od PayU w razie błędu autoryzacji
    if (!tokenResponse.IsSuccessStatusCode)
    {
        var error = await tokenResponse.Content.ReadAsStringAsync();
        throw new Exception($"Błąd autoryzacji PayU: {error}");
    }

    // Automatyczne mapowanie dzięki [JsonPropertyName]
    var tokenData = await tokenResponse.Content.ReadFromJsonAsync<PayUAuthResponse>();

    // 2. TWORZENIE ZAMÓWIENIA W PAYU
    var orderPayload = new
    {
        notifyUrl = "https://enrich-steadier-unopposed.ngrok-free.dev/api/webhooks/payu", // Twój aktualny Ngrok
        customerIp = "127.0.0.1",
        merchantPosId = posId,
        description = $"Zamówienie nr {order.OrderNumber}",
        currencyCode = "PLN",
        totalAmount = (int)(order.TotalPrice * 100), 
        extOrderId = order.OrderId.ToString(), 
        products = order.Items.Select(i => new 
        { 
            name = i.Dish?.Name ?? "Danie", 
            unitPrice = (int)(i.UnitPrice * 100), 
            quantity = i.Quantity 
        }).ToList()
    };

    var orderRequest = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/api/v2_1/orders");
    orderRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenData!.AccessToken);
    orderRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    orderRequest.Content = new StringContent(JsonSerializer.Serialize(orderPayload), Encoding.UTF8, "application/json");

    var orderResponse = await httpClient.SendAsync(orderRequest);
    
    // Zabezpieczenie wypluwające powód odrzucenia zamówienia przez PayU
    if (!orderResponse.IsSuccessStatusCode)
    {
        var error = await orderResponse.Content.ReadAsStringAsync();
        throw new Exception($"Błąd tworzenia zamówienia PayU: {error}");
    }

    var finalUrl = orderResponse.RequestMessage?.RequestUri?.ToString();
    if (finalUrl != null && !finalUrl.EndsWith("orders"))
    {
        // Mamy to! Zwracamy gotowy link do opłacenia
        return finalUrl; 
    }

    // Wersja awaryjna (gdyby PayU wyjątkowo zwróciło czystego JSON-a)
    var orderResult = await orderResponse.Content.ReadFromJsonAsync<PayUOrderResponse>();
    return orderResult!.RedirectUri;
    
}

    public async Task ProcessNotificationAsync(string body, string signatureHeader)
    {
        var md5Key = config["PayU:Md5Key"];
        string expectedSignature = GenerateMd5Hash(body + md5Key);

        if (string.IsNullOrEmpty(signatureHeader) || !signatureHeader.Contains($"signature={expectedSignature}"))
        {
            throw new UnauthorizedAccessException("Niepoprawny podpis transakcji");
        }
        
        var notification = JsonSerializer.Deserialize<PayUNotification>(body);

        if (notification?.order != null && int.TryParse(notification.order.extOrderId, out var orderId))
        {
            var order = await context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order != null)
            {
                if (notification.order.status == "COMPLETED")
                {
                    if (!order.IsPaid)
                    {
                        order.IsPaid = true;
                    }
                }
                else if (notification.order.status == "CANCELED")
                {
                    order.IsPaid = false;
                    order.Status = OrderStatus.Anulowane;
                }
                await context.SaveChangesAsync();
            }
        }
        
    }

    private string GenerateMd5Hash(string input)
    {
        using var md5 = MD5.Create();
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = md5.ComputeHash(bytes);
        return string.Concat(hash.Select(b => b.ToString("x2")));
    }
    
    
    public class PayUAuthResponse 
    { 
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty; 
    
        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = string.Empty;
    
        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    
        [JsonPropertyName("grant_type")]
        public string GrantType { get; set; } = string.Empty;
    }

    public class PayUOrderResponse 
    { 
        [JsonPropertyName("redirectUri")]
        public string RedirectUri { get; set; } = string.Empty; 
    
        [JsonPropertyName("orderId")]
        public string OrderId { get; set; } = string.Empty;
    
        [JsonPropertyName("extOrderId")]
        public string ExtOrderId { get; set; } = string.Empty;
    }
    public class PayUNotification {  public PayUNotificationOrder? order { get; set; } }
    public class PayUNotificationOrder { public string extOrderId { get; set; } = string.Empty; public string status { get; set; } = string.Empty; }
}


using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace cxserver.Modules.Sales.Services;

public sealed class RazorpayGatewayService(HttpClient httpClient, IOptions<RazorpaySettings> settingsOptions)
{
    private readonly RazorpaySettings settings = settingsOptions.Value;

    public bool IsEnabled => settings.Enabled && !string.IsNullOrWhiteSpace(settings.KeyId) && !string.IsNullOrWhiteSpace(settings.KeySecret);

    public string KeyId => settings.KeyId;
    public string MerchantName => settings.MerchantName;
    public string ThemeColor => settings.ThemeColor;

    public async Task<RazorpayOrderResponse> CreateOrderAsync(int amountInSubunits, string currency, string receipt, CancellationToken cancellationToken)
    {
        EnsureEnabled();
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.razorpay.com/v1/orders");
        request.Headers.Authorization = CreateBasicAuthHeader();
        request.Content = new StringContent(JsonSerializer.Serialize(new
        {
            amount = amountInSubunits,
            currency,
            receipt
        }), Encoding.UTF8, "application/json");

        using var response = await httpClient.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Unable to initialize Razorpay order. {body}");
        }

        var payload = JsonSerializer.Deserialize<RazorpayOrderResponse>(body, JsonOptions()) ?? throw new InvalidOperationException("Invalid Razorpay order response.");
        return payload;
    }

    public async Task<RazorpayPaymentResponse> GetPaymentAsync(string paymentId, CancellationToken cancellationToken)
    {
        EnsureEnabled();
        using var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.razorpay.com/v1/payments/{paymentId}");
        request.Headers.Authorization = CreateBasicAuthHeader();

        using var response = await httpClient.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Unable to fetch Razorpay payment. {body}");
        }

        return JsonSerializer.Deserialize<RazorpayPaymentResponse>(body, JsonOptions()) ?? throw new InvalidOperationException("Invalid Razorpay payment response.");
    }

    public async Task<IReadOnlyList<RazorpayPaymentResponse>> GetOrderPaymentsAsync(string gatewayOrderId, CancellationToken cancellationToken)
    {
        EnsureEnabled();
        using var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.razorpay.com/v1/orders/{gatewayOrderId}/payments");
        request.Headers.Authorization = CreateBasicAuthHeader();

        using var response = await httpClient.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Unable to fetch Razorpay order payments. {body}");
        }

        var payload = JsonSerializer.Deserialize<RazorpayOrderPaymentsResponse>(body, JsonOptions())
            ?? throw new InvalidOperationException("Invalid Razorpay order payments response.");
        return payload.Items;
    }

    public bool VerifyCheckoutSignature(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature)
    {
        EnsureEnabled();
        if (string.IsNullOrWhiteSpace(razorpayOrderId) || string.IsNullOrWhiteSpace(razorpayPaymentId) || string.IsNullOrWhiteSpace(razorpaySignature))
        {
            return false;
        }

        var payload = $"{razorpayOrderId}|{razorpayPaymentId}";
        var expectedSignature = ComputeSignature(payload, settings.KeySecret);
        return FixedTimeEquals(expectedSignature, razorpaySignature.Trim());
    }

    public bool VerifyWebhookSignature(string requestBody, string signature)
    {
        if (string.IsNullOrWhiteSpace(settings.WebhookSecret))
        {
            return false;
        }

        var expectedSignature = ComputeSignature(requestBody, settings.WebhookSecret);
        return FixedTimeEquals(expectedSignature, signature.Trim());
    }

    private AuthenticationHeaderValue CreateBasicAuthHeader()
    {
        var raw = $"{settings.KeyId}:{settings.KeySecret}";
        return new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.UTF8.GetBytes(raw)));
    }

    private static string ComputeSignature(string payload, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static bool FixedTimeEquals(string left, string right)
    {
        var leftBytes = Encoding.UTF8.GetBytes(left);
        var rightBytes = Encoding.UTF8.GetBytes(right);
        return CryptographicOperations.FixedTimeEquals(leftBytes, rightBytes);
    }

    private void EnsureEnabled()
    {
        if (!IsEnabled)
        {
            throw new InvalidOperationException("Razorpay integration is not configured.");
        }
    }

    private static JsonSerializerOptions JsonOptions()
        => new()
        {
            PropertyNameCaseInsensitive = true
        };
}

public sealed class RazorpayOrderResponse
{
    public string Id { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public int Amount { get; set; }
    public int AmountPaid { get; set; }
    public int AmountDue { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Receipt { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public sealed class RazorpayPaymentResponse
{
    public string Id { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public int Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public string Vpa { get; set; } = string.Empty;
}

public sealed class RazorpayOrderPaymentsResponse
{
    public List<RazorpayPaymentResponse> Items { get; set; } = [];
}

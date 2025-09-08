# Webhook Integration Guide

## Overview

This guide explains how to integrate with the Nehtw.com webhook system to receive real-time notifications about download status changes and account updates.

## Webhook Configuration

### Setting Up Webhooks

1. **Access Admin Panel**
   - Go to `/admin/webhooks` in your StockMedia Pro application
   - You must be logged in as an admin user

2. **Configure Webhook URL**
   - Set your webhook URL (e.g., `https://your-domain.com/api/webhooks/nehtw`)
   - Use `https://webhook.site/` for testing

3. **Subscribe to Events**
   - **Download status changing**: Order updates, download links, errors, refunds
   - **Stock account status changing**: Account status, daily limits, re-submission needs

### Webhook URL Format

Your webhook endpoint should be accessible via GET requests:

```
https://your-domain.com/api/webhooks/nehtw
```

## Request Structure

### Method
```
GET
```

### Headers
Nehtw.com sends event information via custom HTTP headers:

| Header | Description | Example |
|--------|-------------|---------|
| `x-neh-event_name` | Event type | `download_status_changed` |
| `x-neh-status` | Event status | `completed`, `failed`, `processing` |
| `x-neh-order_id` | Order identifier | `order_123` |
| `x-neh-download_url` | Download link (when completed) | `https://download.example.com/file.zip` |
| `x-neh-error` | Error message (when failed) | `Download timeout` |
| `x-neh-task_id` | Alternative order identifier | `task_456` |

### Example Request

```http
GET /api/webhooks/nehtw HTTP/1.1
Host: your-domain.com
x-neh-event_name: download_status_changed
x-neh-status: completed
x-neh-order_id: order_123
x-neh-download_url: https://download.example.com/file.zip
x-neh-timestamp: 1640995200
```

## Event Types

### 1. Download Status Events

**Event Name:** `download_status_changed`

**Possible Statuses:**
- `processing` - Order is being processed
- `completed` - Download is ready
- `failed` - Download failed
- `cancelled` - Order was cancelled

**Headers:**
- `x-neh-order_id` - Your order ID
- `x-neh-status` - Current status
- `x-neh-download_url` - Download link (when completed)
- `x-neh-error` - Error message (when failed)

### 2. Account Status Events

**Event Name:** `account_status_changed`

**Possible Statuses:**
- `daily_limit_reached` - Daily download limit reached
- `account_suspended` - Account suspended
- `account_reactivated` - Account reactivated
- `need_resubmit` - Account needs re-submission

**Headers:**
- `x-neh-status` - Account status
- `x-neh-account_id` - Account identifier
- `x-neh-message` - Additional information

## Implementation Examples

### Node.js/Express

```javascript
app.get('/api/webhooks/nehtw', (req, res) => {
  const eventName = req.headers['x-neh-event_name']
  const status = req.headers['x-neh-status']
  const orderId = req.headers['x-neh-order_id']
  const downloadUrl = req.headers['x-neh-download_url']
  const error = req.headers['x-neh-error']

  console.log('Webhook received:', {
    eventName,
    status,
    orderId,
    downloadUrl,
    error
  })

  // Handle different events
  switch (eventName) {
    case 'download_status_changed':
      handleDownloadStatusChanged(orderId, status, downloadUrl, error)
      break
    case 'account_status_changed':
      handleAccountStatusChanged(status, req.headers)
      break
  }

  res.json({ success: true })
})
```

### PHP

```php
<?php
$eventName = $_SERVER['HTTP_X_NEH_EVENT_NAME'] ?? '';
$status = $_SERVER['HTTP_X_NEH_STATUS'] ?? '';
$orderId = $_SERVER['HTTP_X_NEH_ORDER_ID'] ?? '';
$downloadUrl = $_SERVER['HTTP_X_NEH_DOWNLOAD_URL'] ?? '';
$error = $_SERVER['HTTP_X_NEH_ERROR'] ?? '';

// Log the webhook
error_log("Webhook received: $eventName - $status - $orderId");

// Handle the event
switch ($eventName) {
    case 'download_status_changed':
        handleDownloadStatusChanged($orderId, $status, $downloadUrl, $error);
        break;
    case 'account_status_changed':
        handleAccountStatusChanged($status, $_SERVER);
        break;
}

http_response_code(200);
echo json_encode(['success' => true]);
?>
```

### Python/Flask

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/webhooks/nehtw', methods=['GET'])
def webhook():
    event_name = request.headers.get('x-neh-event_name')
    status = request.headers.get('x-neh-status')
    order_id = request.headers.get('x-neh-order_id')
    download_url = request.headers.get('x-neh-download_url')
    error = request.headers.get('x-neh-error')

    print(f"Webhook received: {event_name} - {status} - {order_id}")

    if event_name == 'download_status_changed':
        handle_download_status_changed(order_id, status, download_url, error)
    elif event_name == 'account_status_changed':
        handle_account_status_changed(status, request.headers)

    return jsonify({'success': True})
```

## StockMedia Pro Integration

### Webhook Handler

The StockMedia Pro application includes a built-in webhook handler at `/api/webhooks/nehtw` that:

1. **Processes incoming webhooks** from Nehtw.com
2. **Updates order status** in the database
3. **Refunds points** when orders fail or are cancelled
4. **Notifies users** via email when downloads are ready
5. **Logs events** for monitoring and debugging

### Database Updates

When a webhook is received, the system automatically:

- Updates the `Order` table with new status
- Adds download URLs when available
- Records error messages for failed orders
- Refunds points to user accounts
- Creates transaction records for point refunds

### User Notifications

The system can send notifications to users when:

- Downloads are completed and ready
- Orders fail and points are refunded
- Account status changes affect their service

## Testing Webhooks

### Using webhook.site

1. Go to [webhook.site](https://webhook.site/)
2. Copy the unique URL provided
3. Set this URL in your webhook configuration
4. Place a test order to trigger webhook events

### Testing with curl

```bash
curl -X GET "https://your-domain.com/api/webhooks/nehtw" \
  -H "x-neh-event_name: download_status_changed" \
  -H "x-neh-status: completed" \
  -H "x-neh-order_id: test-order-123" \
  -H "x-neh-download_url: https://example.com/test-file.zip"
```

### Testing in StockMedia Pro

1. Go to `/admin/webhooks`
2. Click "Test Webhook" button
3. Check the response and logs

## Security Considerations

### Webhook Verification

While Nehtw.com doesn't provide signature verification, you should:

1. **Validate required headers** are present
2. **Check order IDs** exist in your database
3. **Rate limit** webhook endpoints
4. **Log all webhook events** for debugging
5. **Monitor for suspicious activity**

### Example Security Check

```javascript
function validateWebhook(req) {
  const requiredHeaders = ['x-neh-event_name', 'x-neh-status']
  
  for (const header of requiredHeaders) {
    if (!req.headers[header]) {
      throw new Error(`Missing required header: ${header}`)
    }
  }
  
  // Additional validation logic
  return true
}
```

## Monitoring and Debugging

### Logging

Always log webhook events for debugging:

```javascript
console.log('Webhook received:', {
  timestamp: new Date().toISOString(),
  eventName: req.headers['x-neh-event_name'],
  status: req.headers['x-neh-status'],
  orderId: req.headers['x-neh-order_id'],
  allHeaders: req.headers
})
```

### Error Handling

Implement proper error handling:

```javascript
try {
  // Process webhook
  await processWebhook(req.headers)
} catch (error) {
  console.error('Webhook processing failed:', error)
  // Send alert to monitoring service
  await sendAlert('Webhook processing failed', error)
}
```

### Health Checks

Monitor webhook endpoint health:

```javascript
app.get('/api/webhooks/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  })
})
```

## Troubleshooting

### Common Issues

1. **Webhook not received**
   - Check URL is accessible from internet
   - Verify webhook configuration in Nehtw.com
   - Check server logs for errors

2. **Order not found**
   - Verify order ID format
   - Check database connection
   - Ensure order exists in your system

3. **Points not refunded**
   - Check user ID is correct
   - Verify points balance exists
   - Check transaction logs

### Debug Steps

1. **Enable detailed logging**
2. **Test with webhook.site**
3. **Check database state**
4. **Verify API responses**
5. **Monitor error logs**

## Support

For webhook integration support:

- **Documentation**: Check this guide and API docs
- **Testing**: Use webhook.site for testing
- **Issues**: Contact support with webhook logs
- **Monitoring**: Set up alerts for webhook failures

---

**Need help?** Contact support with your webhook logs and we'll help you troubleshoot!

import dotenv from 'dotenv';
dotenv.config();

async function testWaafi() {
  const fields = [
    { schemaVersion: "1.0" },
    { requestId: `${Date.now()}` },
    { timestamp: `${Date.now()}` },
    { channelName: "WEB" },
    { serviceName: "API_PURCHASE" },
    { serviceParams: {
        merchantUid:   process.env.WAAFIPAY_MERCHANT_UID,
        apiUserId:     process.env.WAAFIPAY_API_USER_ID,
        apiKey:        process.env.WAAFIPAY_API_KEY,
        paymentMethod: "mwallet_account",
        payerInfo: { accountNo: "252615123456" },
        transactionInfo: {
          referenceId: "REF-123", invoiceId: "INV-123",
          amount:      1,
          currency:    "USD",
          description: `Travel Agency Payment - INV-123`
        }
      } 
    }
  ];

  let currentPayload = {};

  for (const field of fields) {
    Object.assign(currentPayload, field);
    console.log(`\nTesting payload with keys: ${Object.keys(currentPayload).join(', ')}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const waafiRes  = await fetch(process.env.WAAFIPAY_API_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(currentPayload),
        signal: controller.signal
      });
      const text = await waafiRes.text();
      console.log('Status:', waafiRes.status, 'Response:', text.substring(0, 50));
    } catch (err) {
      console.error('Fetch failed:', err.message);
      break;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

testWaafi();

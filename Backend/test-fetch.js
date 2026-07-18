import dotenv from 'dotenv';
dotenv.config();

async function testWaafi() {
  console.log('URL:', process.env.WAAFIPAY_API_URL);
  try {
    const res = await fetch(process.env.WAAFIPAY_API_URL || 'https://api.waafipay.net/asm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testWaafi();

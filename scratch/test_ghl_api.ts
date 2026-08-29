
const GHL_TOKEN = process.env.GHL_API_KEY;

if (!GHL_TOKEN) {
  throw new Error('GHL_API_KEY is required');
}
const LOCATION_ID = "73hS2pnWQWKCJaCEjUqq";

async function testGHLAPI() {
  console.log("Testing GHL API V2 - Products Sub-Resources...");
  
  const endpoints = [
    `https://services.leadconnectorhq.com/products/prices?locationId=${LOCATION_ID}`,
    `https://services.leadconnectorhq.com/products/collections?locationId=${LOCATION_ID}`
  ];

  for (const url of endpoints) {
    console.log(`\n--- Testing: ${url} ---`);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${GHL_TOKEN}`,
          "Version": "2021-07-28",
          "Accept": "application/json"
        }
      });

      console.log("Status:", response.status);
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        console.log("Data:", JSON.stringify(data, null, 2));
      } catch (e) {
        console.log("Response text (not JSON):", text || "(empty)");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  }
}

testGHLAPI();

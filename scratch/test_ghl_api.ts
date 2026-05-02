
const GHL_TOKEN = "pit-e6515d66-ee32-4962-a702-e8aa4980653d";
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

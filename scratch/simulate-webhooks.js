const https = require('https');

function postWebhook(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'nabdtraining.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, res => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: responseData }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testWebhooks() {
  console.log("=== إرسال بيانات تجريبية للـ Webhooks الثلاثة ===");
  const testEmail = "webhook_test@example.com";
  const courseTitle = "Test Course Auto";

  // 1. Test Enrollment
  console.log("\n1. جاري إرسال التسجيل (Enrollment)...");
  const enrollRes = await postWebhook('/api/webhooks/ghl/enrollment', {
    email: testEmail,
    courseTitle: courseTitle,
    firstName: "Test",
    lastName: "User"
  });
  console.log("النتيجة:", enrollRes);

  // 2. Test Progress
  console.log("\n2. جاري إرسال التقدم (Progress = 45%)...");
  const progressRes = await postWebhook('/api/webhooks/ghl/progress', {
    email: testEmail,
    courseTitle: courseTitle,
    progress: 45
  });
  console.log("النتيجة:", progressRes);

  // 3. Test Evaluation
  console.log("\n3. جاري إرسال التقييم (Evaluation = 4 stars)...");
  const evalRes = await postWebhook('/api/webhooks/ghl/evaluation', {
    email: testEmail,
    courseTitle: courseTitle,
    rating: 4,
    feedback: "Excellent"
  });
  console.log("النتيجة:", evalRes);
}

testWebhooks();

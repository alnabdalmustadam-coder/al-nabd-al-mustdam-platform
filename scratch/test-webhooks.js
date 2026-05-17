const fs = require('fs');

async function testWebhooks() {
  console.log("Testing Enrollment Webhook...");
  const enrollmentPayload = {
    email: "test_user_ghl@example.com",
    firstName: "Test",
    lastName: "User",
    courseId: "course-123",
    courseTitle: "Test Course",
    courseUrl: "https://members.nabdtraining.com/library"
  };

  try {
    const res = await fetch("http://localhost:3000/api/webhooks/ghl/enrollment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enrollmentPayload)
    });
    console.log("Enrollment Response:", await res.json());
  } catch(e) {
    console.log("Enrollment Fetch Failed:", e.message);
  }

  console.log("\nTesting Progress Webhook...");
  const progressPayload = {
    email: "test_user_ghl@example.com",
    courseId: "course-123",
    courseTitle: "Test Course",
    progress: "50%",
    completed: "false"
  };

  try {
    const res = await fetch("http://localhost:3000/api/webhooks/ghl/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progressPayload)
    });
    console.log("Progress Response:", await res.json());
  } catch(e) {
    console.log("Progress Fetch Failed:", e.message);
  }
}

testWebhooks();

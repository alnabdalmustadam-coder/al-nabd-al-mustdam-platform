/**
 * Helper utility to submit form data to LeadConnector (GoHighLevel) from the client-side.
 * This bypasses Cloudflare security blocks that occur when sending from the server.
 */

export async function submitToGHL(data: { name?: string; email?: string; phone?: string; [key: string]: any }) {
  try {
    // Split name into first and last
    const nameParts = (data.name || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const ghlBody = new URLSearchParams();
    ghlBody.append("formId", "O8dD5KvfiHWPaB3zpuzM");
    ghlBody.append("locationId", "69cd9d874fab82876c2c10e7");
    ghlBody.append("terms", "on"); // Mandatory for GHL form processing
    
    // Map fields to GHL standard names
    ghlBody.append("firstName", firstName);
    ghlBody.append("lastName", lastName);
    ghlBody.append("email", data.email || "");
    ghlBody.append("phone", data.phone || "");
    
    // Add any other fields if available
    Object.keys(data).forEach(key => {
      if (!["name", "email", "phone"].includes(key)) {
        ghlBody.append(key, String(data[key]));
      }
    });

    // Use the correct white-labeled form submission endpoint
    const response = await fetch("https://services.leadconnectorhq.com/form/submit", {
      method: "POST",

      body: ghlBody.toString(),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      console.warn("GHL Submission Warning:", response.status, result);
    } else {
      console.log("GHL Submission Success:", result);
    }
    return result;
  } catch (err) {
    console.error("GHL Submission Error:", err);
    return null;
  }
}


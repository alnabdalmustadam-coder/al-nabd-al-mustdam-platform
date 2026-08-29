import { NextResponse } from "next/server";
import { verifyBasicAuth, xapiUnauthorizedResponse } from "@/lib/security/integrations";

/**
 * xAPI About Resource — /api/xapi/about
 *
 * Returns information about the LRS.
 * Required by the xAPI 1.0.3 specification.
 *
 * Reference: https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md#aboutresource
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Experience-API-Version",
  "X-Experience-API-Version": "1.0.3",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

export async function GET(req: Request) {
  if (!verifyBasicAuth(req)) return xapiUnauthorizedResponse();
  return NextResponse.json(
    {
      version: ["1.0.3", "1.0.2", "1.0.1", "1.0.0"],
      extensions: {
        "https://nabdtraining.com/extensions/platform": "Sustain Pulse LRS",
        "https://nabdtraining.com/extensions/nelc-accredited": true,
        "https://nabdtraining.com/extensions/provider":
          "النبض المستدام - Sustain Pulse",
        "https://nabdtraining.com/extensions/description":
          "Internal Learning Record Store for NELC accreditation compliance",
      },
    },
    { headers: CORS }
  );
}

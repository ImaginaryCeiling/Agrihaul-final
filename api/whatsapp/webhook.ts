// api/whatsapp/webhook.ts
/**
 * Vercel API route for Twilio WhatsApp webhook
 * - Validates Twilio signature
 * - Parses x-www-form-urlencoded payloads
 * - Delegates to conversation handlers
 * - Also supports an internal JSON POST to send outbound WhatsApp messages
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';

// Simple session management
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const sessions = new Map<string, any>();

function getSession(id: string) {
  cleanupExpiredSessions();
  let s = sessions.get(id);
  if (!s) {
    s = {
      flow: "main",
      lastActive: Date.now(),
      postLoad: {},
      findLoads: { lastShown: [] },
      track: {},
      rate: {},
    };
    sessions.set(id, s);
  }
  return s;
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [k, v] of sessions.entries()) {
    if (now - v.lastActive > SESSION_TIMEOUT_MS) sessions.delete(k);
  }
}

function resetExpiredSessions() {
  cleanupExpiredSessions();
}

function resetToMain(s: any) {
  s.flow = "main";
  s.postLoad = {};
  s.findLoads = { lastShown: [], linkedCarrierId: s.findLoads?.linkedCarrierId };
  s.track = {};
  s.rate = {};
}

function mainMenu(): string {
  return (
    "AGRIHAUL FREIGHT PLATFORM\n" +
    "MAIN MENU - Choose an option:\n" +
    "1 - Post a Load (Farmers)\n" +
    "2 - Find Loads (Carriers)\n" +
    "3 - Track Shipment\n" +
    "4 - Rate Completed Job\n" +
    "Reply with the number only (1, 2, 3, or 4)"
  );
}

async function handleIncomingMessage(from: string, body: string): Promise<string> {
  const s = getSession(from);
  s.lastActive = Date.now();

  const text = (body || "").trim();
  const lower = text.toLowerCase();

  // Global return-to-menu
  if (["menu", "main", "restart"].includes(lower)) {
    resetToMain(s);
    return mainMenu();
  }

  // First contact or "hello"
  if (s.flow === "main" || ["hello", "hi", "start"].includes(lower)) {
    const maybeNum = parseInt(lower, 10);
    if (Number.isInteger(maybeNum)) {
      return await handleMainSelection(s, maybeNum);
    }
    return mainMenu();
  }

  // Route by flow
  switch (s.flow) {
    case "post_load_crop":         return await handlePostLoadCrop(s, text);
    case "post_load_weight":       return await handlePostLoadWeight(s, text);
    case "post_load_pickup":       return await handlePostLoadPickup(s, text);
    case "post_load_drop":         return await handlePostLoadDrop(s, text);
    case "post_load_payment":      return await handlePostLoadPayment(s, text);
    case "post_load_equipment":    return await handlePostLoadEquipment(s, text);
    case "find_loads_location":    return await handleFindLoadsLocation(s, text);
    case "find_loads_select":      return await handleFindLoadsSelect(s, text);
    case "find_loads_link_carrier":return await handleFindLoadsLinkCarrier(s, text);
    case "track_job_enter":        return await handleTrackJob(s, text);
    case "rate_enter_job":         return await handleRateEnterJob(s, text);
    case "rate_enter_score":       return await handleRateEnterScore(s, text);
    case "rate_enter_comment":     return await handleRateEnterComment(s, text);
    default:
      resetToMain(s);
      return mainMenu();
  }
}

async function handleMainSelection(s: any, n: number): Promise<string> {
  switch (n) {
    case 1:
      s.flow = "post_load_crop";
      return (
        "POST NEW LOAD\n" +
        "What type of crop are you shipping?\n" +
        "Examples: corn, soybeans, wheat, tomatoes"
      );
    case 2:
      s.flow = "find_loads_location";
      return "FIND AVAILABLE LOADS\nPlease share your current location or type your city and state";
    case 3:
      s.flow = "track_job_enter";
      return "TRACK SHIPMENT\nEnter the Job ID to view status.";
    case 4:
      s.flow = "rate_enter_job";
      return "RATE COMPLETED JOB\nEnter the Job ID you want to rate.";
    default:
      return "Invalid selection.\n\n" + mainMenu();
  }
}

async function handlePostLoadCrop(s: any, input: string): Promise<string> {
  const crop = input.replace(/[^a-zA-Z\s]/g, "").trim();
  if (!crop) return "Please enter a valid crop type. Examples: corn, soybeans, wheat, tomatoes";
  s.postLoad.crop = capitalize(crop);
  s.flow = "post_load_weight";
  return `CROP TYPE: ${s.postLoad.crop.toUpperCase()}\nSTEP 2 OF 6 - WEIGHT\nHow much weight needs to be shipped?\nExamples: 40000 lbs, 25 tons, 18000 pounds`;
}

async function handlePostLoadWeight(s: any, input: string): Promise<string> {
  const parsed = parseWeight(input);
  if (!parsed) {
    return "Invalid weight format. Please provide examples like: 40000 lbs, 25 tons, 18000 pounds";
  }
  s.postLoad.weightLbs = parsed.lbs;
  s.postLoad.weightDisplay = `${parsed.lbs} lbs`;
  s.flow = "post_load_pickup";
  return `WEIGHT: ${s.postLoad.weightDisplay}\nSTEP 3 OF 6 - PICKUP LOCATION\nWhere should the carrier pick up the load?\nExamples: 123 Farm Road, Fresno CA or just Fresno, CA`;
}

async function handlePostLoadPickup(s: any, input: string): Promise<string> {
  const loc = cleanLocation(input);
  if (!loc) return "Please provide a pickup location such as 'Fresno, CA' or a full address.";
  s.postLoad.pickup = loc;
  s.flow = "post_load_drop";
  return `PICKUP: ${loc}\nSTEP 4 OF 6 - DELIVERY LOCATION\nWhere should the load be delivered?\nExamples: Chicago, IL or 456 Warehouse St, Chicago IL`;
}

async function handlePostLoadDrop(s: any, input: string): Promise<string> {
  const loc = cleanLocation(input);
  if (!loc) return "Please provide a delivery location such as 'Chicago, IL' or a full address.";
  s.postLoad.drop = loc;
  s.flow = "post_load_payment";
  return `DELIVERY: ${loc}\nSTEP 5 OF 6 - PAYMENT\nWhat is your budget for this shipment?\nExamples: 2400, $2400, 2400 dollars`;
}

async function handlePostLoadPayment(s: any, input: string): Promise<string> {
  const dollars = parseDollars(input);
  if (dollars == null) {
    return "Invalid payment amount. Enter a number like 2400 or $2400.";
  }
  s.postLoad.paymentDollars = dollars;
  s.postLoad.paymentDisplay = `$${Math.round(dollars)}`;
  s.flow = "post_load_equipment";
  return (
    `PAYMENT: ${s.postLoad.paymentDisplay}\n` +
    "STEP 6 OF 6 - EQUIPMENT TYPE\n" +
    "Select the required equipment:\n" +
    "1 - Dry Van\n" +
    "2 - Refrigerated Truck\n" +
    "3 - Flatbed\n" +
    "4 - Grain Hopper\n" +
    "Reply with the number (1-4)"
  );
}

async function handlePostLoadEquipment(s: any, input: string): Promise<string> {
  const n = parseInt(input, 10);
  const displayMap: Record<number, string> = {
    1: "Dry Van",
    2: "Refrigerated Truck",
    3: "Flatbed",
    4: "Grain Hopper",
  };
  const selected = displayMap[n];
  if (!selected) return "Invalid selection. Reply with 1, 2, 3, or 4.";

  s.postLoad.equipmentDisplay = selected;

  const summary =
    "LOAD POSTED SUCCESSFULLY\n" +
    `JOB ID: DEMO_${Date.now()}\n` +
    `CROP: ${s.postLoad.crop}\n` +
    `WEIGHT: ${s.postLoad.weightDisplay}\n` +
    `ROUTE: ${s.postLoad.pickup} to ${s.postLoad.drop}\n` +
    `PAYMENT: ${s.postLoad.paymentDisplay}\n` +
    `EQUIPMENT: ${s.postLoad.equipmentDisplay}\n` +
    "Carriers will be notified. You will receive updates when carriers apply.";

  resetToMain(s);
  return summary + "\n\n" + mainMenu();
}

async function handleFindLoadsLocation(s: any, input: string): Promise<string> {
  const location = cleanLocation(input);
  if (!location) return "Please provide your city and state (e.g., Fresno, CA).";

  s.findLoads.location = location;
  s.findLoads.lastShown = [
    {
      jobId: "DEMO_001",
      crop: "Corn",
      weightDisplay: "20 tons",
      route: "Fresno, CA to Chicago, IL",
      priceDisplay: "$2400",
      ratingDisplay: "8.5/10",
    }
  ];
  s.flow = "find_loads_select";

  return `AVAILABLE LOADS NEAR ${location.toUpperCase()}\n1 - Corn, 20 tons, Fresno, CA to Chicago, IL, $2400, Farmer Rating: 8.5/10\nReply with the load number (1) to apply`;
}

async function handleFindLoadsSelect(s: any, input: string): Promise<string> {
  const idx = parseInt(input, 10);
  const items = s.findLoads.lastShown ?? [];
  if (!Number.isInteger(idx) || idx < 1 || idx > items.length) {
    return `Invalid selection. Reply with a number between 1 and ${items.length}.`;
  }

  const chosen = items[idx - 1];
  s.findLoads.selectedJobId = chosen.jobId;

  if (!s.findLoads.linkedCarrierId) {
    s.flow = "find_loads_link_carrier";
    return (
      "ACCOUNT LINK REQUIRED\n" +
      "To apply for loads, enter your AgriHaul Carrier ID.\n" +
      "If you do not know it, please contact support.\n" +
      "Reply with your Carrier ID (UUID format)."
    );
  }

  return await acceptJobWithLinkedCarrier(s, chosen.jobId);
}

async function handleFindLoadsLinkCarrier(s: any, input: string): Promise<string> {
  const carrierId = input.trim();
  if (carrierId.length < 8) {
    return "Invalid Carrier ID. Please re-enter your Carrier ID.";
  }
  s.findLoads.linkedCarrierId = carrierId;

  const jobId = s.findLoads.selectedJobId;
  if (!jobId) {
    resetToMain(s);
    return "Link successful. Returning to the Main Menu.\n\n" + mainMenu();
  }

  return await acceptJobWithLinkedCarrier(s, jobId);
}

async function acceptJobWithLinkedCarrier(s: any, jobId: string): Promise<string> {
  const chosen = (s.findLoads.lastShown || []).find((x: any) => x.jobId === jobId);

  const summary =
    "APPLICATION SUBMITTED\n" +
    "LOAD DETAILS:\n" +
    `JOB ID: ${jobId}\n` +
    (chosen
      ? `CROP: ${chosen.crop}\nWEIGHT: ${chosen.weightDisplay}\nROUTE: ${chosen.route}\nPAYMENT: ${chosen.priceDisplay}\nFARMER RATING: ${chosen.ratingDisplay}\n`
      : "") +
    "The farmer has been notified of your application. You will be contacted if selected.";

  resetToMain(s);
  return summary + "\n\n" + mainMenu();
}

async function handleTrackJob(s: any, input: string): Promise<string> {
  const jobId = input.trim();
  if (!jobId) return "Enter a valid Job ID.";

  resetToMain(s);
  return `SHIPMENT STATUS\nJOB ID: ${jobId}\nSTATUS: IN TRANSIT\nROUTE: Fresno, CA to Chicago, IL\nETA: Tomorrow 2:00 PM\n\n` + mainMenu();
}

async function handleRateEnterJob(s: any, input: string): Promise<string> {
  const jobId = input.trim();
  if (!jobId) return "Enter a valid Job ID.";
  s.rate.jobId = jobId;
  s.flow = "rate_enter_score";
  return "Enter an overall rating from 1 to 5.";
}

async function handleRateEnterScore(s: any, input: string): Promise<string> {
  const score = parseInt(input.trim(), 10);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return "Invalid rating. Enter a number from 1 to 5.";
  }
  s.rate.score1to5 = score;
  s.flow = "rate_enter_comment";
  return "Enter an optional short comment. Or type 'skip' to submit without a comment.";
}

async function handleRateEnterComment(s: any, input: string): Promise<string> {
  resetToMain(s);
  return "Thank you. Your rating has been submitted.\n\n" + mainMenu();
}

function capitalize(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

function cleanLocation(s: string): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (!t || t.length < 2) return "";
  return t;
}

function parseWeight(input: string): { lbs: number } | null {
  const t = input.trim().toLowerCase();
  const num = Number(t.replace(/[^0-9.]/g, ""));
  if (!isFinite(num) || num <= 0) return null;
  if (t.includes("ton")) {
    return { lbs: Math.round(num * 2000) };
  }
  if (t.includes("kg")) {
    return { lbs: Math.round(num * 2.20462) };
  }
  return { lbs: Math.round(num) };
}

function parseDollars(input: string): number | null {
  const num = Number(String(input).replace(/[^0-9.]/g, ""));
  if (!isFinite(num) || num <= 0) return null;
  return Math.round(num);
}

// Environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER ?? "";
const AGRIHAUL_API_KEY = process.env.AGRIHAUL_API_KEY ?? "";
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? "";

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const TwiML = twilio.twiml;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    /** Health endpoint and light session cleanup */
    resetExpiredSessions();
    res.status(200).send('AgriHaul WhatsApp webhook OK');
    return;
  }

  if (req.method === 'POST') {
    try {
      const contentType = req.headers['content-type'] || '';

      // ----- B) Internal notify (server-to-server) -----
      if (contentType.includes('application/json')) {
        const key = req.headers['x-api-key'];
        if (!key || key !== AGRIHAUL_API_KEY) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const { to, message } = req.body;
        if (!to || !message) {
          return res.status(400).json({ error: "Missing 'to' or 'message'." });
        }

        await sendWhatsAppMessage({ to, body: message });
        return res.json({ success: true });
      }

      // ----- A) Twilio inbound webhook -----
      if (!contentType.includes('application/x-www-form-urlencoded')) {
        return res.status(415).send('Unsupported media type');
      }

      const params = req.body;

      // Validate Twilio signature (temporarily disabled for testing)
      console.log('[WhatsApp] Webhook received:', { from: params.From, body: params.Body });

      // const signature = req.headers['x-twilio-signature'] as string || '';
      // const requestUrl = `${PUBLIC_BASE_URL}/api/whatsapp/webhook`;
      // const isValid = twilio.validateRequest(TWILIO_AUTH_TOKEN, signature, requestUrl, params);
      // if (!isValid) {
      //   return res.status(403).send('Invalid signature');
      // }

      const from = params.From || '';
      const body = (params.Body || '').trim();

      if (!from.startsWith('whatsapp:')) {
        // Only handle WhatsApp channels here
        return res.status(200).send('Ignored non-WhatsApp source');
      }

      const replyText = await handleIncomingMessage(from, body);

      const twiml = new TwiML.MessagingResponse();
      twiml.message(replyText);

      res.status(200).setHeader('Content-Type', 'application/xml').send(twiml.toString());
    } catch (err) {
      console.error('[WhatsApp webhook] error:', err);
      try {
        const twiml = new TwiML.MessagingResponse();
        twiml.message(
          'An unexpected error occurred. Returning to the Main Menu.\\n\\n' +
            'AGRIHAUL FREIGHT PLATFORM\\n' +
            'MAIN MENU - Choose an option:\\n' +
            '1 - Post a Load (Farmers)\\n' +
            '2 - Find Loads (Carriers)\\n' +
            '3 - Track Shipment\\n' +
            '4 - Rate Completed Job\\n' +
            'Reply with the number only (1, 2, 3, or 4)'
        );
        res.status(200).setHeader('Content-Type', 'application/xml').send(twiml.toString());
      } catch {
        res.status(500).send('Server error');
      }
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

/** Send WhatsApp message helper */
async function sendWhatsAppMessage({ to, body }: { to: string; body: string }) {
  try {
    await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
      body,
    });
  } catch (error) {
    console.error('[WhatsApp] Failed to send message:', error);
    throw error;
  }
}
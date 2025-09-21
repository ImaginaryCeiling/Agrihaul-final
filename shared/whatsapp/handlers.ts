// shared/whatsapp/handlers.ts
/**
 * Conversation logic for the numbered-menu WhatsApp chatbot,
 * aligned to AgriHaul REST API v1.0.
 *
 * Key changes:
 * - Uses "x-api-key" header for service access
 * - Create Job uses: load_size (tons), payout_dollars, pickup_address, dropoff_address, equipment_needed[]
 * - "Find Loads" fetches status=open and filters by pickup_address (simple substring match)
 * - Accept Job requires carrier_id; we add a one-time link step to capture/store it per phone
 * - Ratings: a simple 1-5 is mapped to all six required categories (0-10)
 */

import { ApiEnvelope, EquipmentDisplay, EquipmentSlug, FindLoadsItem, SessionState } from "./types";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const BASE = process.env.API_BASE_URL || "http://localhost:3001";
const API_KEY = process.env.AGRIHAUL_API_KEY ?? "";

// In-memory session store (swap for Redis in prod if needed)
const sessions = new Map<string, SessionState>();

/** Returns the session for a WhatsApp sender, creating if missing. */
function getSession(id: string): SessionState {
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

function touch(s: SessionState) {
  s.lastActive = Date.now();
}

function resetToMain(s: SessionState) {
  s.flow = "main";
  s.postLoad = {};
  s.findLoads = { lastShown: [], linkedCarrierId: s.findLoads?.linkedCarrierId }; // keep link
  s.track = {};
  s.rate = {};
}

export function resetExpiredSessions() {
  cleanupExpiredSessions();
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [k, v] of sessions.entries()) {
    if (now - v.lastActive > SESSION_TIMEOUT_MS) sessions.delete(k);
  }
}

/** Main entry invoked by the webhook route. */
export async function handleIncomingMessage(from: string, body: string): Promise<string> {
  const s = getSession(from);
  touch(s);

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

/** ===== Menus and common prompts ===== */

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

async function handleMainSelection(s: SessionState, n: number): Promise<string> {
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

/** ===== Post Load (Farmer) ===== */

async function handlePostLoadCrop(s: SessionState, input: string): Promise<string> {
  const crop = input.replace(/[^a-zA-Z\s]/g, "").trim();
  if (!crop) return "Please enter a valid crop type. Examples: corn, soybeans, wheat, tomatoes";
  s.postLoad.crop = capitalize(crop);
  s.flow = "post_load_weight";
  return `CROP TYPE: ${s.postLoad.crop.toUpperCase()}\nSTEP 2 OF 6 - WEIGHT\nHow much weight needs to be shipped?\nExamples: 40000 lbs, 25 tons, 18000 pounds`;
}

async function handlePostLoadWeight(s: SessionState, input: string): Promise<string> {
  const parsed = parseWeight(input);
  if (!parsed) {
    return "Invalid weight format. Please provide examples like: 40000 lbs, 25 tons, 18000 pounds";
  }
  s.postLoad.weightLbs = parsed.lbs;
  s.postLoad.weightDisplay = `${parsed.lbs} lbs`;
  s.flow = "post_load_pickup";
  return `WEIGHT: ${s.postLoad.weightDisplay}\nSTEP 3 OF 6 - PICKUP LOCATION\nWhere should the carrier pick up the load?\nExamples: 123 Farm Road, Fresno CA or just Fresno, CA`;
}

async function handlePostLoadPickup(s: SessionState, input: string): Promise<string> {
  const loc = cleanLocation(input);
  if (!loc) return "Please provide a pickup location such as 'Fresno, CA' or a full address.";
  s.postLoad.pickup = loc;
  s.flow = "post_load_drop";
  return `PICKUP: ${loc}\nSTEP 4 OF 6 - DELIVERY LOCATION\nWhere should the load be delivered?\nExamples: Chicago, IL or 456 Warehouse St, Chicago IL`;
}

async function handlePostLoadDrop(s: SessionState, input: string): Promise<string> {
  const loc = cleanLocation(input);
  if (!loc) return "Please provide a delivery location such as 'Chicago, IL' or a full address.";
  s.postLoad.drop = loc;
  s.flow = "post_load_payment";
  return `DELIVERY: ${loc}\nSTEP 5 OF 6 - PAYMENT\nWhat is your budget for this shipment?\nExamples: 2400, $2400, 2400 dollars`;
}

async function handlePostLoadPayment(s: SessionState, input: string): Promise<string> {
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

async function handlePostLoadEquipment(s: SessionState, input: string): Promise<string> {
  const n = parseInt(input, 10);
  const displayMap: Record<number, EquipmentDisplay> = {
    1: "Dry Van",
    2: "Refrigerated Truck",
    3: "Flatbed",
    4: "Grain Hopper",
  };
  const selected = displayMap[n];
  if (!selected) return "Invalid selection. Reply with 1, 2, 3, or 4.";

  s.postLoad.equipmentDisplay = selected;

  // Map to API payload
  const equipmentSlug: EquipmentSlug =
    selected === "Dry Van" ? "dry van" :
    selected === "Refrigerated Truck" ? "refrigerated" :
    selected === "Flatbed" ? "flatbed" : "grain hopper";

  // Convert lbs → tons for load_size (round to 1 decimal to be friendly)
  const load_size = s.postLoad.weightLbs ? Number((s.postLoad.weightLbs / 2000).toFixed(1)) : undefined;

  try {
    const res = await fetch(`${BASE}/api/v1/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        crop: s.postLoad.crop,                       // "Corn"
        load_size,                                   // e.g., 20.0
        payout_dollars: s.postLoad.paymentDollars,   // e.g., 2400
        pickup_address: s.postLoad.pickup,           // "Fresno, CA"
        dropoff_address: s.postLoad.drop,            // "Chicago, IL"
        equipment_needed: [equipmentSlug],           // ["grain hopper"]
        is_perishable: false,
        notes: "Posted via WhatsApp",
      }),
    });

    const j = (await res.json()) as ApiEnvelope<any>;
    if (!res.ok || !j?.success) throw new Error(j?.error || `HTTP ${res.status}`);

    const jobId: string = j.data?.id ?? j.data?.job?.id ?? "JOB_UNKNOWN";
    s.postLoad.jobId = jobId;

    const summary =
      "LOAD POSTED SUCCESSFULLY\n" +
      `JOB ID: ${jobId}\n` +
      `CROP: ${s.postLoad.crop}\n` +
      `WEIGHT: ${s.postLoad.weightDisplay}\n` +
      `ROUTE: ${s.postLoad.pickup} to ${s.postLoad.drop}\n` +
      `PAYMENT: ${s.postLoad.paymentDisplay}\n` +
      `EQUIPMENT: ${s.postLoad.equipmentDisplay}\n` +
      "Carriers will be notified. You will receive updates when carriers apply.";

    resetToMain(s);
    return summary + "\n\n" + mainMenu();
  } catch (e) {
    console.error("[post load] error:", e);
    resetToMain(s);
    return "We could not post the load due to a system error. Returning to the Main Menu.\n\n" + mainMenu();
  }
}

/** ===== Find Loads (Carrier) ===== */

async function handleFindLoadsLocation(s: SessionState, input: string): Promise<string> {
  const location = cleanLocation(input);
  if (!location) return "Please provide your city and state (e.g., Fresno, CA).";

  try {
    // No location param in API; fetch open jobs and filter by pickup_address on the client
    const url = new URL(`${BASE}/api/v1/jobs`);
    url.searchParams.set("status", "open");
    url.searchParams.set("limit", "25");

    const res = await fetch(url.toString(), {
      headers: { "x-api-key": API_KEY },
    });
    const j = (await res.json()) as ApiEnvelope<any[]>;
    if (!res.ok || !j?.success) throw new Error(j?.error || `HTTP ${res.status}`);

    const city = location.toLowerCase();
    const all = Array.isArray(j.data) ? j.data : [];
    const nearby = all
      .filter((x: any) => String(x.pickup_address ?? "").toLowerCase().includes(city))
      .slice(0, 3);

    if (!nearby.length) {
      resetToMain(s);
      return `No loads found near ${location}.\n\n` + mainMenu();
    }

    const items: FindLoadsItem[] = nearby.map((x: any) => {
      const crop = String(x.crop ?? "Unknown");
      const weightDisplay =
        typeof x.load_size === "number" ? `${x.load_size} tons` : "N/A";
      const priceDisplay =
        typeof x.payout_dollars === "number" ? `$${Math.round(x.payout_dollars)}` : "N/A";
      const ratingDisplay =
        typeof x.farmer?.rating_overall === "number"
          ? `${x.farmer.rating_overall.toFixed(1)}/10`
          : "N/A";
      return {
        jobId: String(x.id ?? "JOB_UNKNOWN"),
        crop,
        weightDisplay,
        route: `${x.pickup_address ?? "N/A"} to ${x.dropoff_address ?? "N/A"}`,
        priceDisplay,
        ratingDisplay,
      };
    });

    s.findLoads.location = location;
    s.findLoads.lastShown = items;
    s.flow = "find_loads_select";

    const list = items
      .map(
        (it, i) =>
          `${i + 1} - ${it.crop}, ${it.weightDisplay}, ${it.route}, ${it.priceDisplay}, Farmer Rating: ${it.ratingDisplay}`
      )
      .join("\n");

    return `AVAILABLE LOADS NEAR ${location.toUpperCase()}\n${list}\nReply with the load number (1-${items.length}) to apply`;
  } catch (e) {
    console.error("[find loads] error:", e);
    resetToMain(s);
    return "We could not fetch loads right now. Returning to the Main Menu.\n\n" + mainMenu();
  }
}

async function handleFindLoadsSelect(s: SessionState, input: string): Promise<string> {
  const idx = parseInt(input, 10);
  const items = s.findLoads.lastShown ?? [];
  if (!Number.isInteger(idx) || idx < 1 || idx > items.length) {
    return `Invalid selection. Reply with a number between 1 and ${items.length}.`;
  }

  const chosen = items[idx - 1];
  s.findLoads.selectedJobId = chosen.jobId;

  // Require a linked carrier_id to accept the job using x-api-key
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

async function handleFindLoadsLinkCarrier(s: SessionState, input: string): Promise<string> {
  const carrierId = input.trim();
  // Minimal validation: UUID-like length check
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

async function acceptJobWithLinkedCarrier(s: SessionState, jobId: string): Promise<string> {
  try {
    const res = await fetch(`${BASE}/api/v1/jobs/${encodeURIComponent(jobId)}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ carrier_id: s.findLoads.linkedCarrierId }),
    });
    const j = (await res.json()) as ApiEnvelope<any>;
    if (!res.ok || !j?.success) throw new Error(j?.error || `HTTP ${res.status}`);

    // We already have chosen item's details in lastShown; re-surface them
    const chosen = (s.findLoads.lastShown || []).find((x) => x.jobId === jobId);

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
  } catch (e) {
    console.error("[accept job] error:", e);
    resetToMain(s);
    return "We could not submit your application. Returning to the Main Menu.\n\n" + mainMenu();
  }
}

/** ===== Track Shipment ===== */

async function handleTrackJob(s: SessionState, input: string): Promise<string> {
  const jobId = input.trim();
  if (!jobId) return "Enter a valid Job ID.";

  try {
    const res = await fetch(`${BASE}/api/v1/jobs/${encodeURIComponent(jobId)}`, {
      headers: { "x-api-key": API_KEY },
    });
    const j = (await res.json()) as ApiEnvelope<any>;
    if (!res.ok || !j?.success) throw new Error(j?.error || `HTTP ${res.status}`);

    const job = j.data ?? {};
    const status = String(job.status ?? "unknown").toUpperCase(); // open | accepted | in_transit | delivered | paid | cancelled
    const pickup = job.pickup_address ?? "N/A";
    const drop = job.dropoff_address ?? "N/A";
    const eta = job.eta ? new Date(job.eta).toLocaleString() : "N/A";

    resetToMain(s);
    return `SHIPMENT STATUS\nJOB ID: ${jobId}\nSTATUS: ${status}\nROUTE: ${pickup} to ${drop}\nETA: ${eta}\n\n` + mainMenu();
  } catch (e) {
    console.error("[track job] error:", e);
    resetToMain(s);
    return "We could not find that job. Returning to the Main Menu.\n\n" + mainMenu();
  }
}

/** ===== Ratings (maps 1–5 to all six categories 0–10) ===== */

async function handleRateEnterJob(s: SessionState, input: string): Promise<string> {
  const jobId = input.trim();
  if (!jobId) return "Enter a valid Job ID.";
  s.rate.jobId = jobId;
  s.flow = "rate_enter_score";
  return "Enter an overall rating from 1 to 5.";
}

async function handleRateEnterScore(s: SessionState, input: string): Promise<string> {
  const score = parseInt(input.trim(), 10);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return "Invalid rating. Enter a number from 1 to 5.";
  }
  s.rate.score1to5 = score;
  s.flow = "rate_enter_comment";
  return "Enter an optional short comment. Or type 'skip' to submit without a comment.";
}

async function handleRateEnterComment(s: SessionState, input: string): Promise<string> {
  const jobId = s.rate.jobId!;
  const overall1to5 = s.rate.score1to5!;
  const comment = input.trim().toLowerCase() === "skip" ? "" : input.trim();

  // We need the ratee_id (e.g., farmer) for the job.
  try {
    const resJob = await fetch(`${BASE}/api/v1/jobs/${encodeURIComponent(jobId)}`, {
      headers: { "x-api-key": API_KEY },
    });
    const jJob = (await resJob.json()) as ApiEnvelope<any>;
    if (!resJob.ok || !jJob?.success) throw new Error(jJob?.error || `HTTP ${resJob.status}`);

    const job = jJob.data ?? {};
    const rateeId = job.farmer_id || job.farmerId;
    if (!rateeId) throw new Error("ratee_id not found for job");

    // Map 1–5 → 0–10
    const val = Math.max(0, Math.min(10, overall1to5 * 2));

    const payload = {
      job_id: jobId,
      ratee_id: rateeId,
      on_time: val,
      communication: val,
      accuracy: val,
      compliance: val,
      condition: val,
      resolution: val,
      comment,
    };

    const res = await fetch(`${BASE}/api/v1/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const j = (await res.json()) as ApiEnvelope<any>;
    if (!res.ok || !j?.success) throw new Error(j?.error || `HTTP ${res.status}`);

    resetToMain(s);
    return "Thank you. Your rating has been submitted.\n\n" + mainMenu();
  } catch (e) {
    console.error("[rating] error:", e);
    resetToMain(s);
    return "We could not submit your rating. Returning to the Main Menu.\n\n" + mainMenu();
  }
}

/** ===== Utilities ===== */

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
    return { lbs: Math.round(num * 2000) }; // US short tons
  }
  if (t.includes("kg")) {
    return { lbs: Math.round(num * 2.20462) };
  }
  // default lbs
  return { lbs: Math.round(num) };
}

function parseDollars(input: string): number | null {
  const num = Number(String(input).replace(/[^0-9.]/g, ""));
  if (!isFinite(num) || num <= 0) return null;
  return Math.round(num); // integer dollars
}
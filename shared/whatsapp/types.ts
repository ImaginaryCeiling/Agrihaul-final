// shared/whatsapp/types.ts
// Types aligned with AgriHaul REST API v1.0 and the numbered-menu chatbot.

/**
 * Conversation states (numbered menu and steps).
 */
export type Flow =
  | "main"
  | "post_load_crop"
  | "post_load_weight"
  | "post_load_pickup"
  | "post_load_drop"
  | "post_load_payment"
  | "post_load_equipment"
  | "find_loads_location"
  | "find_loads_select"
  | "find_loads_link_carrier" // one-time carrier ID link before accept
  | "track_job_enter"
  | "rate_enter_job"
  | "rate_enter_score"
  | "rate_enter_comment";

/** Display equipment names shown in prompts. */
export type EquipmentDisplay =
  | "Dry Van"
  | "Refrigerated Truck"
  | "Flatbed"
  | "Grain Hopper";

/** API equipment slugs expected by /jobs (equipment_needed). */
export type EquipmentSlug = "dry van" | "refrigerated" | "flatbed" | "grain hopper";

/**
 * Per-flow data buckets.
 */
export interface PostLoadData {
  crop?: string;
  weightDisplay?: string; // as shown to user (e.g., "40000 lbs")
  weightLbs?: number;     // normalized
  pickup?: string;
  drop?: string;
  paymentDisplay?: string; // "$2400"
  paymentDollars?: number; // normalized dollars
  equipmentDisplay?: EquipmentDisplay;
  jobId?: string;
}

export interface FindLoadsItem {
  jobId: string;
  crop: string;
  weightDisplay: string;
  route: string;
  priceDisplay: string;
  ratingDisplay: string;
}

export interface FindLoadsData {
  location?: string;
  lastShown?: FindLoadsItem[];
  selectedJobId?: string;
  // account linking
  linkedCarrierId?: string;
}

export interface TrackJobData {
  jobId?: string;
}

export interface RateJobData {
  jobId?: string;
  score1to5?: number;
  comment?: string;
}

export interface SessionState {
  flow: Flow;
  lastActive: number; // epoch ms for TTL checks
  postLoad: PostLoadData;
  findLoads: FindLoadsData;
  track: TrackJobData;
  rate: RateJobData;
}

/** Twilio webhook fields we actually use. */
export interface TwilioWebhookBody {
  From: string;
  Body: string;
}

/** API envelope shape per docs. */
export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: unknown;
}
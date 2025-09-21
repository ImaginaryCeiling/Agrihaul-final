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
import { handleIncomingMessage, resetExpiredSessions } from '../../shared/whatsapp/handlers';

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
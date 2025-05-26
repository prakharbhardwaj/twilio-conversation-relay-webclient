import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyWs from "@fastify/websocket";
import fastifyFormbody from "@fastify/formbody";
import fastifyStatic from "@fastify/static";
import OpenAI from "openai";
import dotenv from "dotenv";
import Twilio from "twilio";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.NGROK_URL;
const WS_URL = `wss://${DOMAIN}/ws`;

// Twilio Credentials for Client SDK
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_API_KEY = process.env.TWILIO_API_KEY || process.env.TWILIO_ACCOUNT_SID;
const TWILIO_API_SECRET = process.env.TWILIO_API_SECRET || process.env.TWILIO_AUTH_TOKEN;
const TWILIO_TWIML_APP_SID = process.env.TWILIO_TWIML_APP_SID;

const SYSTEM_PROMPT = `<prompt>
# Objective
You are a voice AI assistant engaging in a human-like voice conversation with the user. Your goal is to assist the user with online shopping tasks, such as providing product details, comparing options, adding items to the cart, and tracking orders. Be as human-like as possible and create a smooth, engaging conversation.

# Role
## General:
  - As an online shopping assistant, you help users browse products, compare options, check availability, add items to the cart, and track orders.
  - You can suggest product recommendations based on user preferences.
  - You can provide information on product prices, specifications, and special offers.
  - You do not handle payment or complete checkout; instead, guide the user to place items in the cart and suggest the next steps.
  - You do not provide delivery dates but can confirm if an item is in stock.
  - Politely ask for clarification if needed.
  - You always reply in English.
</prompt>`;

const sessions = new Map();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function aiResponse(messages) {
  let completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    tools: []
  });

  console.log("AI Response:", completion.choices[0].message);
  return completion.choices[0].message.content;
}

const fastify = Fastify();
fastify.register(fastifyCors, { origin: true });
fastify.register(fastifyFormbody);
fastify.register(fastifyWs);

// Serve static files from public directory
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

// Serve the main HTML page
fastify.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

// Generate Twilio access token for browser client
fastify.post("/get-token", async (request, reply) => {
  try {
    // Validate required credentials
    if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY || !TWILIO_API_SECRET || !TWILIO_TWIML_APP_SID) {
      throw new Error("Missing required Twilio credentials");
    }

    const identity = `web-client-${Date.now()}`;

    // Create an access token
    const AccessToken = Twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: TWILIO_TWIML_APP_SID,
      incomingAllow: true
    });

    const token = new AccessToken(TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET, { identity: identity });

    token.addGrant(voiceGrant);

    return reply.send({
      success: true,
      token: token.toJwt(),
      identity: identity
    });
  } catch (error) {
    console.error("Error generating access token:", error);
    console.error("Error details:", error.stack);
    return reply.status(400).send({
      success: false,
      error: error.message
    });
  }
});

// Handle TwiML for outbound calls from browser
fastify.post("/voice", async (request, reply) => {
  try {
    return reply.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Connect>
            <ConversationRelay url="${WS_URL}" welcomeGreeting="I’m your shopping assistant! Just say what you need, and I’ll help you find it. What can I assist you with today?" ttsProvider="ElevenLabs" voice="21m00Tcm4TlvDq8ikWAM" transcriptionProvider="deepgram" speechModel="nova-2" interruptible="speech" dtmfDetection="true">
              <Parameter name="flowSid" value="FW49d9a509649df96762862d9c4e2b5515"/>
            </ConversationRelay>
        </Connect>
    </Response>`);
  } catch (error) {
    console.error("Error generating TwiML:", error);
    const twiml = new Twilio.twiml.VoiceResponse();
    twiml.say("Sorry, there was an error connecting to the assistant.");

    reply.type("text/xml");
    return reply.send(twiml.toString());
  }
});

// WebSocket handler for ConversationRelay
fastify.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, (ws, req) => {
    console.log("WebSocket connection established");

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data);
        console.log("Received WebSocket message:", message.type);

        switch (message.type) {
          case "setup":
            const callSid = message.callSid;
            console.log("Setup for call:", callSid);
            ws.callSid = callSid;
            sessions.set(callSid, [{ role: "system", content: SYSTEM_PROMPT }]);
            break;

          case "prompt":
            console.log("Processing prompt:", message.voicePrompt);
            const conversation = sessions.get(ws.callSid) || [{ role: "system", content: SYSTEM_PROMPT }];
            conversation.push({ role: "user", content: message.voicePrompt });

            const response = await aiResponse(conversation);
            conversation.push({ role: "assistant", content: response });
            sessions.set(ws.callSid, conversation);

            ws.send(
              JSON.stringify({
                type: "text",
                token: response,
                last: true
              })
            );
            console.log("Sent response:", response);
            break;

          case "interrupt":
            console.log("Handling interruption.");
            break;

          default:
            console.warn("Unknown message type received:", message.type);
            break;
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
      if (ws.callSid) {
        sessions.delete(ws.callSid);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
});

try {
  fastify.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Server running at http://localhost:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

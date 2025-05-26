# Twilio ConversationRelay Web Client

A browser-based AI voice assistant using Twilio Voice SDK v2.x with real-time conversation capabilities. Talk to an AI assistant directly through your web browser without needing phone numbers.

![Browser Voice Assistant](https://img.shields.io/badge/Twilio-Voice%20SDK%20v2.x-red?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-blue?style=flat-square)
![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-orange?style=flat-square)

## Features

- **Browser-based voice interface** - Click microphone to start talking
- **AI-powered conversations** - Integrated with OpenAI GPT for intelligent responses
- **Real-time audio** - Uses Twilio Voice SDK v2.x for WebRTC communication
- **No phone numbers required** - Direct browser-to-AI communication
- **Responsive design** - Works on desktop and mobile browsers
- **Connection state management** - Visual feedback for call status
- **Secure token handling** - Server-side access token generation

## Quick Start

### Prerequisites

- Node.js 18+
- Twilio account with Voice capabilities
- OpenAI API key
- Ngrok (for local development)

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone git@github.com:prakharbhardwaj/twilio-conversation-relay-webclient.git
   cd twilio-conversation-relay-webclient
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your credentials (see Configuration section below)
   ```

3. **Start the server:**

   ```bash
   npm start
   ```

4. **Open your browser:**

   ```
   http://localhost:3000
   ```

5. **Allow microphone access** and click the microphone button to start talking!

## Configuration

### Required Environment Variables

Create a `.env` file with the following variables:

```bash
# OpenAI API Key - Get from https://platform.openai.com/
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Ngrok URL (without https://) - Your ngrok tunnel URL
NGROK_URL="your-ngrok-id.ngrok-free.app"

# Twilio Account Credentials - From Twilio Console
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"

# Twilio API Keys - Create in Twilio Console > API Keys
TWILIO_API_KEY="SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_API_SECRET="your_api_secret_here"

# TwiML Application SID - Create in Twilio Console > Voice > TwiML Apps
TWILIO_TWIML_APP_SID="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Optional - Server port (defaults to 3000)
PORT=3000
```

### Twilio Setup

**Complete setup guide available in:** [`BROWSER_AUDIO_SETUP.md`](./BROWSER_AUDIO_SETUP.md)

**Quick setup:**

1. Create API Keys in [Twilio Console > API Keys](https://console.twilio.com/us1/develop/api-keys)
2. Create TwiML App in [Twilio Console > Voice > TwiML Apps](https://console.twilio.com/us1/develop/voice/twiml-apps)
3. Set Voice Request URL to: `https://your-ngrok-url.ngrok-free.app/voice`

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Browser   │────│  Twilio Voice    │────│   Your Server   │
│   (Twilio SDK)  │    │   Infrastructure │    │   (Fastify)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         │              WebRTC Audio Stream              │
         └───────────────────────────────────────────────┘
                                │
                                ▼
                     ┌─────────────────┐
                     │   OpenAI API    │
                     │   (GPT-4)       │
                     └─────────────────┘
```

### How It Works

1. **Frontend**: Browser loads Twilio Voice SDK v2.x
2. **Authentication**: Server generates secure access tokens
3. **Connection**: Browser establishes WebRTC connection via Twilio
4. **Audio Processing**: Real-time audio streaming through WebSockets
5. **AI Integration**: Server processes audio with OpenAI for intelligent responses

## Project Structure

```
twilio-conversation-relay-webclient/
├── README.md                    # This file
├── BROWSER_AUDIO_SETUP.md       # Twilio configuration guide
├── package.json                 # Dependencies and scripts
├── server.js                    # Main Fastify server
├── .env.example                 # Environment variables template
├── .env                         # Your environment variables (create this)
└── public/                      # Static web assets
    ├── index.html               # Browser voice interface
    └── twilio.min.js            # Twilio Voice SDK v2.x
```

## API Endpoints

### `POST /get-token`

Generates secure Twilio access tokens for browser connections.

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### `POST /voice`

TwiML endpoint that handles voice calls and integrates with AI.

**Response:** TwiML XML for call handling

### `GET /`

Serves the main web interface (`public/index.html`)

## Frontend Features

- **Microphone Button**: Click to start/end voice conversations
- **Visual Status**: Real-time connection status and call state
- **Responsive UI**: Modern glassmorphism design
- **State Management**: Proper handling of connecting/connected/disconnected states
- **Error Handling**: User-friendly error messages and recovery

## Development

### Local Development with Ngrok

1. **Install ngrok**: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com)

2. **Start your server**: `npm start`

3. **In another terminal, start ngrok**:

   ```bash
   ngrok http 3000
   ```

4. **Update your `.env`** with the ngrok URL:

   ```bash
   NGROK_URL="your-tunnel-id.ngrok-free.app"
   ```

5. **Update TwiML App** in Twilio Console with your ngrok URL

### Browser Developer Tools

Open browser DevTools (F12) to see:

- Twilio SDK connection logs
- WebRTC audio stream status
- Call state transitions
- Error messages and debugging info

## Troubleshooting

### Common Issues

**❌ "Microphone permission required"**

- Allow microphone access in your browser
- Check browser settings for microphone permissions

**❌ "Failed to get access token"**

- Verify your Twilio credentials in `.env`
- Check that your server is running
- Ensure ngrok tunnel is active

**❌ "Device error" or connection failures**

- Verify TwiML App configuration in Twilio Console
- Check that Voice Request URL points to your ngrok tunnel
- Ensure `/voice` endpoint is accessible

**❌ "Call cancelled" or audio issues**

- Check your internet connection
- Verify WebRTC is supported in your browser
- Try refreshing the page and allowing microphone again

### Debug Logs

The application includes extensive logging:

- **Browser Console**: Twilio SDK events and connection status
- **Server Logs**: Token generation and voice endpoint calls
- **Network Tab**: API requests and WebSocket connections

## Support

- **Documentation**: Check [`BROWSER_AUDIO_SETUP.md`](./BROWSER_AUDIO_SETUP.md) for detailed setup
- **Twilio Docs**: [Twilio Voice SDK v2.x Documentation](https://www.twilio.com/docs/voice/sdks/javascript)
- **OpenAI Docs**: [OpenAI API Documentation](https://platform.openai.com/docs)

---

**Built with ❤️ using Twilio Voice SDK, OpenAI, and modern web technologies.**

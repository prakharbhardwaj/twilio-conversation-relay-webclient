# Browser Audio Setup Guide 🎧

To enable audio in/out through the browser, you need to complete these Twilio configuration steps:

## 🔧 Required Twilio Configuration

### 1. Create API Keys (for secure access tokens)

1. Go to [Twilio Console > API Keys](https://console.twilio.com/us1/develop/api-keys)
2. Click "Create New API Key"
3. Give it a name like "Voice Assistant API"
4. Copy the **SID** (this is your `TWILIO_API_KEY`)
5. Copy the **Secret** (this is your `TWILIO_API_SECRET`)
6. Add these to your `.env` file

### 2. Create a TwiML Application

1. Go to [Twilio Console > Voice > TwiML Apps](https://console.twilio.com/us1/develop/voice/twiml-apps)
2. Click "Create new TwiML App"
3. Set these values:
   - **App Name**: "Voice Assistant App" (or any name)
   - **Voice Request URL**: `https://your-ngrok-url.ngrok-free.app/voice`
   - **Voice Request Method**: POST
   - **Voice Status Callback URL**: (leave empty for now)
4. Click "Save"
5. Copy the **Application SID** (starts with `AP...`)
6. Add this as `TWILIO_TWIML_APP_SID` in your `.env` file

### 3. Update Your .env File

```bash
# Twilio API Keys (create these in Twilio Console)
TWILIO_API_KEY="SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_API_SECRET="your_secret_here"

# TwiML Application SID (create this in Twilio Console)
TWILIO_TWIML_APP_SID="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## 🚀 How It Works

1. **Browser Audio**: Uses Twilio Client SDK for browser-to-browser audio
2. **No Phone Numbers**: Audio goes directly from browser to your voice assistant
3. **WebRTC**: Real-time audio communication through the web browser
4. **Microphone/Speaker**: Uses your computer's built-in audio devices

## 🔍 Testing Steps

1. **Start the server**: `node server-new.js`
2. **Open browser**: Go to `http://localhost:3000`
3. **Allow microphone**: Browser will ask for microphone permission
4. **Click microphone button**: Should connect directly to voice assistant
5. **Speak**: You should hear the AI assistant respond through your speakers

## 🐛 Troubleshooting

### "Device not initialized" error:

- Check that all environment variables are set correctly
- Verify your TwiML App SID is correct
- Make sure your ngrok URL is accessible

### "Microphone permission required":

- Click "Allow" when browser asks for microphone access
- Check browser settings if permission was previously denied
- Try refreshing the page after granting permission

### No audio output:

- Check your speaker/headphone volume
- Try using headphones to avoid feedback
- Check browser audio settings

### Connection fails:

- Verify your ngrok tunnel is running on port 3000
- Check that `/voice` endpoint returns valid TwiML
- Look at browser developer console for errors

## 📝 Test Endpoints

You can test these URLs to verify your setup:

- **Main page**: `http://localhost:3000`
- **Get token**: `POST http://localhost:3000/get-token`
- **Voice webhook**: `POST http://localhost:3000/voice`
- **WebSocket**: `wss://your-ngrok-url.ngrok-free.app/ws`

## 🎯 Expected Behavior

1. Page loads → "Ready to connect"
2. Click mic → "Connecting..."
3. Browser asks for mic permission → Click "Allow"
4. Connected → "Connected - Speaking with AI"
5. Speak → AI responds through speakers
6. Click mic again → Call ends

If you're still having issues, check the browser console (F12) for error messages!

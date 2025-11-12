# Google Gemini Chatbot Integration Setup

This guide explains how to set up and use the Google Gemini-powered chatbot in your application.

## Overview

The chatbot has been upgraded from a simple FAQ-based search to a powerful AI assistant powered by Google Gemini. It can:
- Answer questions about government schemes, eligibility, documents, and application processes
- Provide context-aware responses based on user's saved recommendations
- Maintain conversation history for better context understanding
- Fall back to FAQ-based responses if Gemini API is not configured

## Setup Instructions

### 1. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variables

Add the Gemini API key to your `.env` file:

```env
GEMINI_API_KEY=your-google-gemini-api-key-here
```

**Note:** Make sure to add this to your `.env` file (not just `env.example`). The `.env` file should already exist or you can create it based on `env.example`.

### 3. Install Dependencies

The Google Gemini SDK has already been installed. If you need to reinstall:

```bash
npm install @google/generative-ai
```

### 4. Start the Server

```bash
npm run server
```

The chatbot will automatically use Gemini if the API key is configured. If not, it will fall back to FAQ-based responses.

## How It Works

### Backend (Server)

1. **Chatbot Service** (`server/services/chatbotService.js`):
   - Initializes Google Gemini API
   - Builds system prompts with FAQs and scheme context
   - Generates AI responses using Gemini
   - Falls back to FAQ matching if Gemini is unavailable

2. **Chatbot Route** (`server/routes/chatbot.js`):
   - Handles POST requests to `/api/chatbot/message`
   - Fetches user's scheme recommendations for context (if authenticated)
   - Returns AI-generated responses
   - Provides status endpoint at `/api/chatbot/status`
   - Uses model: `models/gemini-2.5-flash` (latest stable version)

### Frontend (Client)

1. **ChatbotWidget** (`client/src/components/ChatbotWidget.jsx`):
   - Updated to call the API instead of local search
   - Maintains conversation history
   - Shows loading states
   - Handles errors gracefully
   - Improved UI with message bubbles

2. **API Service** (`client/src/services/api.js`):
   - Added `chatbotAPI` with `sendMessage` and `getStatus` methods

## Features

### Context-Aware Responses
- The chatbot includes FAQs in its knowledge base
- For authenticated users, it includes their saved scheme recommendations in context
- Conversation history is maintained for better context understanding

### Fallback Mode
- If Gemini API key is not configured, the chatbot falls back to FAQ-based matching
- Users will still get helpful responses based on FAQs

### Error Handling
- Graceful error handling with user-friendly error messages
- Automatic fallback if Gemini API fails

## Testing

### Test the Chatbot Status

```bash
curl http://localhost:5000/api/chatbot/status
```

Response:
```json
{
  "status": "OK",
  "isConfigured": true,
  "apiKeyPresent": true,
  "apiKeyLength": 39,
  "modelStatus": "initialized",
  "model": "models/gemini-2.5-flash",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Chatbot Message

```bash
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What documents do I need for scheme applications?",
    "messageHistory": []
  }'
```

## Usage in Application

The chatbot widget is automatically available in your application. Users can:
1. Click the chat button (bottom-right corner)
2. Ask questions about schemes, eligibility, documents, etc.
3. Get AI-powered responses with context from their recommendations

## Customization

### Adding More FAQs

Edit `server/data/faqs.js` to add more FAQs. The chatbot will automatically include them in its context.

### Adjusting Response Parameters

In `server/services/chatbotService.js`, you can adjust:
- Number of messages in conversation history (default: 6)
- Number of schemes in context (default: 20)
- System prompt instructions

### Changing the Model

In `server/services/chatbotService.js`, change the model:
```javascript
this.model = this.genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
```

Available models:
- `models/gemini-2.5-flash` - Latest stable, faster (default)
- `models/gemini-2.5-pro` - More capable, slower
- `models/gemini-2.0-flash` - Previous version
- `gemini-flash-latest` - Alias for latest flash model
- `gemini-pro-latest` - Alias for latest pro model

**Note:** Model names must include the `models/` prefix for the v1beta API. The old model names like `gemini-pro` and `gemini-1.5-flash` are deprecated and will return 404 errors.

## Troubleshooting

### Chatbot not responding
1. Check if `GEMINI_API_KEY` is set in `.env`
2. Verify the API key is valid
3. Check server logs for errors
4. Test the status endpoint

### Getting fallback responses
- The chatbot is using fallback mode
- Check if `GEMINI_API_KEY` is configured
- Verify the API key is valid and has proper permissions

### API Rate Limits
- Google Gemini has rate limits on free tier
- Consider implementing caching for common questions
- Monitor API usage in Google Cloud Console

## Security Considerations

1. **API Key Security**:
   - Never commit API keys to version control
   - Use environment variables for API keys
   - Rotate API keys regularly

2. **Input Validation**:
   - All user inputs are validated on the server
   - Message length is limited (max 1000 characters)
   - Conversation history is limited (last 10 messages)

3. **Error Handling**:
   - Don't expose API keys in error messages
   - Use generic error messages in production

## Cost Considerations

- Google Gemini API has a free tier with usage limits
- Monitor your API usage in Google Cloud Console
- Consider implementing caching for frequently asked questions
- Rate limiting is already implemented on the server

## Support

For issues or questions:
1. Check server logs for error messages
2. Verify API key configuration
3. Test the status endpoint
4. Check Google Gemini API documentation

## Next Steps

- Add support for multimodal inputs (images, documents)
- Implement response caching
- Add analytics for chatbot usage
- Customize system prompts based on user profile
- Add support for multiple languages


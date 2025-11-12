# Google Gemini API HTTP Endpoints

## Base URL
```
https://generativelanguage.googleapis.com/v1beta
```

## API Endpoints

### 1. Generate Content (Chat Completion)
**Endpoint:** `POST /models/{model}:generateContent`

**Full URL Example:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY
```

**cURL Example:**
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Say hello in one word"
      }]
    }]
  }'
```

### 2. List Available Models
**Endpoint:** `GET /models`

**Full URL Example:**
```
https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY
```

**cURL Example:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```

### 3. Count Tokens
**Endpoint:** `POST /models/{model}:countTokens`

**Full URL Example:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:countTokens?key=YOUR_API_KEY
```

### 4. Stream Generate Content
**Endpoint:** `POST /models/{model}:streamGenerateContent`

**Full URL Example:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=YOUR_API_KEY
```

## Available Models

### Text Generation Models
- `models/gemini-2.5-flash` - Fast, efficient (Recommended)
- `models/gemini-2.5-pro` - More capable, slower
- `models/gemini-2.0-flash` - Previous version
- `models/gemini-2.0-flash-001` - Stable version
- `gemini-flash-latest` - Alias for latest flash
- `gemini-pro-latest` - Alias for latest pro

### Embedding Models
- `models/embedding-001`
- `models/text-embedding-004`
- `models/gemini-embedding-001`

## Request Format

### Generate Content Request Body
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Your question or prompt here"
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 1024
  }
}
```

### Response Format
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Response text here"
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP",
      "index": 0,
      "safetyRatings": [...]
    }
  ],
  "promptFeedback": {...}
}
```

## Authentication

### Method 1: API Key as Query Parameter (Simplest)
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY
```

### Method 2: API Key in Header
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -d '{...}'
```

## Complete Example (Node.js with fetch)

```javascript
const apiKey = 'YOUR_API_KEY';
const model = 'models/gemini-2.5-flash';

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: 'What are the available schemes?'
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
  }
);

const data = await response.json();
const text = data.candidates[0].content.parts[0].text;
console.log(text);
```

## Error Responses

### 404 Not Found
```json
{
  "error": {
    "code": 404,
    "message": "models/gemini-pro is not found for API version v1beta",
    "status": "NOT_FOUND"
  }
}
```

### 403 Forbidden (Invalid API Key)
```json
{
  "error": {
    "code": 403,
    "message": "API key not valid. Please pass a valid API key.",
    "status": "PERMISSION_DENIED"
  }
}
```

### 400 Bad Request
```json
{
  "error": {
    "code": 400,
    "message": "Request contains an invalid argument.",
    "status": "INVALID_ARGUMENT"
  }
}
```

## Rate Limits

- Free tier: 15 requests per minute (RPM)
- Paid tier: Higher limits based on your plan

## Current Implementation

In this project, we're using the `@google/generative-ai` SDK which handles the HTTP requests automatically. The SDK uses:

**Base URL:** `https://generativelanguage.googleapis.com/v1beta`
**Model:** `models/gemini-2.5-flash`
**Method:** `POST /models/{model}:generateContent`

## Testing with Your API Key

Replace `YOUR_API_KEY` with your actual API key from `.env` file:

```bash
# Test with your API key
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyCHqtT0RHN_0dLUHFeOX_a1p37dSL4E4Y8" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Say hello"
      }]
    }]
  }'
```

## Documentation

- Official API Documentation: https://ai.google.dev/api
- API Reference: https://ai.google.dev/api/rest
- Models List: https://ai.google.dev/models/gemini


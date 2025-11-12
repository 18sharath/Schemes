# Chatbot Portal Links Feature - Implementation Summary

## Overview
The chatbot has been updated to include and display official portal links for government schemes. The chatbot now extracts portal URLs from scheme data and instructs Gemini AI to always include portal links in responses.

## Changes Made

### 1. Backend - Chatbot Route (`server/routes/chatbot.js`)

**URL Extraction:**
- Extracts URLs from multiple possible fields: `url`, `official_url`, `website`, `official_website`, `link`, `official_link`, `portal_url`, `application_url`
- Extracts URLs from text fields (application process, details) using regex patterns
- Supports multiple URL formats:
  - Full URLs: `https://portal.gov.in`
  - www URLs: `www.portal.gov.in`
  - Domain patterns: `portal.gov.in`, `scheme.nic.in`

**Scheme Context:**
- Now includes `application` field and `portal_url` in scheme data passed to chatbot service
- Extracted URLs are cleaned (remove trailing punctuation)

### 2. Backend - Chatbot Service (`server/services/chatbotService.js`)

**Scheme Context Enhancement:**
- Updated `getSchemeContext()` to include:
  - Application process information (first 300 characters)
  - Official Portal URL when available
- Portal URLs are prominently displayed in the scheme context

**System Prompt Updates:**
- Added CRITICAL INSTRUCTIONS section emphasizing portal links
- Instructs Gemini to:
  - ALWAYS include official portal URL when available in scheme data
  - Format portal links clearly (e.g., "Official Portal: https://example.com")
  - Make portal links prominent in responses
  - Use knowledge to suggest portal links when not in data
  - Format links as clickable URLs

### 3. Frontend - Chatbot Widget (`client/src/components/ChatbotWidget.jsx`)

**URL Rendering:**
- Added `formatMessage()` function to detect URLs in bot responses
- URLs are automatically converted to clickable links
- Links open in new tab with security attributes (`target="_blank"`, `rel="noopener noreferrer"`)
- Styled differently for user vs bot messages
- Supports both `http://` and `www.` URL formats

## How It Works

### 1. URL Extraction Flow

```
Scheme Data → Extract from URL fields → Extract from text fields → Pass to Chatbot Service
```

1. First, check for direct URL fields (`url`, `official_url`, etc.)
2. If not found, extract from `application` field text
3. If still not found, extract from `details` field text
4. Clean URLs (remove trailing punctuation)
5. Pass to chatbot service with scheme context

### 2. Chatbot Response Flow

```
User Question → Gemini API → Response with Portal Links → Frontend Rendering → Clickable Links
```

1. User asks about a scheme
2. Chatbot service includes scheme data with portal URLs in context
3. Gemini generates response with portal links (if available in data or from knowledge)
4. Frontend detects URLs in response
5. URLs are rendered as clickable links

### 3. URL Extraction Patterns

The system uses multiple regex patterns to find URLs:
- `https?://[^\s\)]+` - Full HTTP/HTTPS URLs
- `www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s\)]*` - www URLs
- `\b[a-zA-Z0-9-]+\.(gov|nic|in|com|org|net)\.[a-zA-Z]{2,}[^\s\)]*` - Domain patterns

## Features

### ✅ Automatic URL Extraction
- Extracts URLs from multiple fields
- Extracts URLs from text content
- Handles various URL formats

### ✅ Smart URL Detection
- Detects URLs in application process text
- Detects URLs in scheme details
- Cleans URLs (removes trailing punctuation)

### ✅ AI-Powered Portal Links
- Gemini uses scheme data to provide portal links
- Gemini can suggest portal links based on scheme names (even if not in data)
- Gemini formats links prominently in responses

### ✅ Clickable Links in UI
- URLs automatically converted to clickable links
- Links open in new tab
- Secure link handling (noopener, noreferrer)
- Styled appropriately for user/bot messages

## Example Usage

### User Question:
```
"What is the official link for SSP Scholarship?"
```

### Bot Response (with portal link):
```
The SSP Scholarship is available at the following official portal:

Official Portal: https://ssp.karnataka.gov.in

You can apply for this scheme through the official portal. Make sure to check the eligibility requirements and required documents before applying.
```

### User Question:
```
"Where can I apply for PM Kisan?"
```

### Bot Response (with portal link):
```
You can apply for PM Kisan scheme at:

Apply here: https://pmkisan.gov.in

The PM Kisan scheme provides financial assistance to farmers. Visit the official portal to check your eligibility and apply online.
```

## Benefits

1. **User Convenience**: Users get direct access to official portals without searching
2. **Trust**: Official portal links increase trust in the information
3. **Efficiency**: Users can apply directly from chatbot responses
4. **Accessibility**: Links are prominently displayed and clickable
5. **Flexibility**: Works even when URLs aren't in data (Gemini can suggest based on knowledge)

## Limitations

1. **Data Dependency**: Portal links depend on scheme data having URL fields or URLs in text
2. **Extraction Accuracy**: URL extraction from text might not be 100% accurate
3. **Knowledge Limits**: Gemini's knowledge of portal links might not always be current
4. **Scheme Coverage**: Not all schemes might have portal links available

## Future Enhancements

1. **Database of Portal Links**: Create a database of known portal links for schemes
2. **URL Validation**: Validate extracted URLs before displaying
3. **Link Preview**: Show link previews (title, description) before clicking
4. **Multiple Links**: Support multiple portal links per scheme (application, status, etc.)
5. **Regional Links**: Provide region-specific portal links based on user state

## Testing

### Test Cases:

1. **Scheme with Portal URL in Data:**
   - Ask about a scheme that has a portal URL
   - Verify portal link is included in response
   - Verify link is clickable

2. **Scheme without Portal URL:**
   - Ask about a scheme without portal URL in data
   - Verify Gemini suggests a portal link based on knowledge
   - Verify link is clickable

3. **URL Extraction from Text:**
   - Test with schemes that have URLs in application field
   - Verify URLs are extracted correctly
   - Verify URLs are cleaned (no trailing punctuation)

4. **Multiple URLs in Response:**
   - Test with responses containing multiple URLs
   - Verify all URLs are clickable
   - Verify URLs open in new tab

## Configuration

No additional configuration is required. The feature works automatically once:
1. Scheme data includes URL fields or URLs in text
2. Gemini API is configured (GEMINI_API_KEY in .env)
3. Server is restarted

## Troubleshooting

### Portal links not showing:
1. Check if scheme data has URL fields
2. Check if URLs are in application/details text
3. Check server logs for URL extraction
4. Verify Gemini is including links in responses

### URLs not clickable:
1. Check browser console for errors
2. Verify URL format in response
3. Check if URL regex is matching correctly

### Wrong portal links:
1. Verify scheme data accuracy
2. Check URL extraction logic
3. Review Gemini responses for accuracy


const { GoogleGenerativeAI } = require('@google/generative-ai');
const faqs = require('../data/faqs');

class ChatbotService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables. Chatbot will use fallback mode.');
      this.model = null;
      this.genAI = null;
    } else {
      try {
        console.log('Initializing Google Gemini API...');
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        // Use gemini-2.5-flash (latest stable, faster) or gemini-2.5-pro (more capable)
        // Available models: models/gemini-2.5-flash, models/gemini-2.5-pro, gemini-flash-latest, gemini-pro-latest
        this.model = this.genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
        console.log('Google Gemini API initialized successfully with model: models/gemini-2.5-flash');
      } catch (error) {
        console.error('Error initializing Google Gemini API:', error);
        this.model = null;
        this.genAI = null;
      }
    }
  }

  /**
   * Get FAQs context as a formatted string
   * @returns {string} Formatted FAQs context
   */
  getFAQsContext() {
    return faqs
      .map((faq, index) => {
        return `${index + 1}. Q: ${faq.question}\n   A: ${faq.answer}`;
      })
      .join('\n\n');
  }

  /**
   * Get scheme context from user's saved recommendations
   * @param {Array} schemes - Array of scheme objects
   * @returns {string} Formatted scheme context
   */
  getSchemeContext(schemes = []) {
    if (!schemes || schemes.length === 0) {
      return 'No schemes are currently available in the user\'s context.';
    }

    return schemes
      .slice(0, 20) // Limit to 20 schemes to avoid token limits
      .map((scheme, index) => {
        return `${index + 1}. ${scheme.name || 'Unknown Scheme'}\n` +
               `   Category: ${scheme.category || 'N/A'}\n` +
               `   Level: ${scheme.level || 'N/A'}\n` +
               `   Details: ${scheme.details || 'N/A'}\n` +
               `   Benefits: ${scheme.benefits || 'N/A'}\n` +
               `   Eligibility: ${scheme.eligibility || 'N/A'}`;
      })
      .join('\n\n');
  }

  /**
   * Build system prompt with context
   * @param {Array} schemes - Array of scheme objects
   * @returns {string} System prompt
   */
  buildSystemPrompt(schemes = []) {
    const faqsContext = this.getFAQsContext();
    const schemeContext = this.getSchemeContext(schemes);

    return `You are a helpful assistant for a Government Scheme Recommendation System. Your role is to:

1. Answer questions about government schemes, eligibility, documents, and application processes
2. Help users understand scheme benefits and requirements
3. Provide information based on the FAQs and available schemes
4. Be friendly, concise, and informative
5. If you don't know something specific, guide users on how to find the information

IMPORTANT CONTEXT:

FAQs:
${faqsContext}

Available Schemes (from user's recommendations):
${schemeContext}

Instructions:
- Answer questions based on the FAQs and scheme information provided above
- If a user asks about a scheme not in the list, provide general guidance about how to find information
- Be specific when answering about eligibility, documents, or benefits
- Keep responses conversational and helpful
- If the question is unclear, ask for clarification
- Always prioritize accuracy and helpfulness`;
  }

  /**
   * Generate response using Gemini
   * @param {string} userMessage - User's message
   * @param {Array} messageHistory - Previous messages for context
   * @param {Array} schemes - Available schemes for context
   * @returns {Promise<string>} Generated response
   */
  async generateResponse(userMessage, messageHistory = [], schemes = []) {
    // Fallback if API key is not configured
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not configured. Using fallback mode.');
      return this.fallbackResponse(userMessage);
    }

    if (!this.model || !this.genAI) {
      console.warn('Gemini model not initialized. Using fallback mode.');
      return this.fallbackResponse(userMessage);
    }

    try {
      // Build the system prompt with context
      const systemPrompt = this.buildSystemPrompt(schemes);

      // Build conversation history for context (last 6 messages to stay within token limits)
      let conversationContext = '';
      if (messageHistory.length > 0) {
        const recentHistory = messageHistory.slice(-6); // Keep last 6 messages
        conversationContext = '\n\nRecent conversation:\n' + recentHistory
          .map(msg => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            return `${role}: ${msg.text}`;
          })
          .join('\n');
      }

      // Construct the full prompt
      const fullPrompt = `${systemPrompt}${conversationContext}\n\nUser: ${userMessage}\nAssistant:`;

      console.log('Sending request to Gemini API...');
      
      // Generate response (Gemini SDK accepts string directly)
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      console.log('Successfully received response from Gemini API');
      return text.trim();
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      if (error.stack) {
        console.error('Error stack:', error.stack);
      }
      
      // Check if it's a 404 error (model not found)
      if (error.message && error.message.includes('404')) {
        console.error('Model not found error. Trying alternative models...');
        // Try alternative models in order of preference
        const fallbackModels = [
          'gemini-flash-latest',
          'gemini-pro-latest',
          'models/gemini-2.5-pro',
          'models/gemini-2.0-flash',
        ];
        
        for (const modelName of fallbackModels) {
          try {
            console.log(`Trying model: ${modelName}...`);
            const fallbackModel = this.genAI.getGenerativeModel({ model: modelName });
            const systemPrompt = this.buildSystemPrompt(schemes);
            const fullPrompt = `${systemPrompt}${conversationContext}\n\nUser: ${userMessage}\nAssistant:`;
            const result = await fallbackModel.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();
            console.log(`Successfully received response from ${modelName}`);
            // Update the model for future requests
            this.model = fallbackModel;
            return text.trim();
          } catch (fallbackError) {
            console.error(`${modelName} failed:`, fallbackError.message);
            continue;
          }
        }
        console.error('All models failed');
      }
      
      // Fallback to basic response
      return this.fallbackResponse(userMessage);
    }
  }

  /**
   * Fallback response when Gemini is not available
   * @param {string} userMessage - User's message
   * @returns {string} Fallback response
   */
  fallbackResponse(userMessage) {
    const query = userMessage.toLowerCase();
    
    // Try to match FAQs
    const matchedFAQ = faqs.find(faq => {
      const hay = `${faq.question} ${faq.answer} ${faq.tags?.join(' ') || ''}`.toLowerCase();
      return hay.includes(query) || 
             faq.tags?.some(tag => query.includes(tag.toLowerCase()));
    });

    if (matchedFAQ) {
      return `${matchedFAQ.question}\n\n${matchedFAQ.answer}`;
    }

    return `I'm currently using a fallback mode. Please ensure GEMINI_API_KEY is configured in your environment variables for full AI capabilities.\n\nFor now, I can help you with:\n- How to get scheme recommendations\n- Bookmarking schemes\n- Understanding eligibility requirements\n- Required documents\n\nPlease try rephrasing your question or ask about one of these topics.`;
  }
}

module.exports = new ChatbotService();

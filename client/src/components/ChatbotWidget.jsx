import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X, Search, Loader2 } from 'lucide-react';
import { chatbotAPI } from '../services/api';

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m your AI assistant powered by Google Gemini. I can answer FAQs and help you explore schemes. Ask me anything!' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const handleSend = async (e) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q || isLoading) return;

    // Store current message history before updating state
    const currentMessages = messages;
    
    // Add user message to UI immediately
    const userMessage = { role: 'user', text: q };
    const updatedMessages = [...currentMessages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Get message history for context (last 10 messages, including the new one)
      const messageHistory = updatedMessages.slice(-10);
      
      // Call the chatbot API
      const response = await chatbotAPI.sendMessage(q, messageHistory);
      
      // Add bot response to UI
      setMessages((m) => [...m, { role: 'bot', text: response.data.response }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      // Add error message
      const errorMessage = error.response?.data?.message || 
        'Sorry, I encountered an error. Please try again later.';
      setMessages((m) => [...m, { 
        role: 'bot', 
        text: errorMessage 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (open && panelRef.current) {
      const scrollContainer = panelRef.current.querySelector('.overflow-y-auto');
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages, open]);

  return (
    <>
      {/* Floating Button */}
      <button
        title="Chat"
        onClick={() => setOpen((v) => !v)}
        className="fixed z-40 bottom-6 right-6 rounded-full p-4 shadow-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors"
      >
        {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="fixed z-40 bottom-24 right-6 w-[92vw] max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-xl flex flex-col overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600 dark:text-indigo-300" />
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Assistant</h4>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="px-4 py-3 space-y-3 max-h-[50vh] overflow-y-auto flex flex-col">
            {messages.map((m, idx) => {
              // Convert URLs in text to clickable links
              const formatMessage = (text) => {
                const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
                const parts = [];
                let lastIndex = 0;
                let match;
                
                while ((match = urlRegex.exec(text)) !== null) {
                  // Add text before URL
                  if (match.index > lastIndex) {
                    parts.push(text.substring(lastIndex, match.index));
                  }
                  
                  // Add clickable URL
                  let url = match[0];
                  if (url.startsWith('www.')) {
                    url = 'https://' + url;
                  }
                  
                  parts.push(
                    <a
                      key={match.index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${
                        m.role === 'user'
                          ? 'text-blue-200 underline hover:text-blue-100'
                          : 'text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300'
                      } break-all`}
                    >
                      {match[0]}
                    </a>
                  );
                  
                  lastIndex = match.index + match[0].length;
                }
                
                // Add remaining text
                if (lastIndex < text.length) {
                  parts.push(text.substring(lastIndex));
                }
                
                return parts.length > 0 ? parts : text;
              };
              
              return (
                <div 
                  key={idx} 
                  className={`${
                    m.role === 'user' 
                      ? 'self-end max-w-[80%] bg-blue-600 text-white rounded-lg p-2 px-3' 
                      : 'self-start max-w-[90%] text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 px-3'
                  } whitespace-pre-line break-words`}
                >
                  {formatMessage(m.text)}
                </div>
              );
            })}
            {isLoading && (
              <div className="self-start max-w-[90%] bg-gray-100 dark:bg-gray-800 rounded-lg p-2 px-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">Thinking...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about eligibility, documents, or a scheme name…"
              className="flex-1 form-input bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;



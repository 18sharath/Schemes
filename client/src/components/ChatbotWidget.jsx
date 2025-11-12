import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Send, X, Search } from 'lucide-react';
import faqs from '../data/faqs';

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I can answer FAQs and help you explore schemes. Ask me anything.' },
  ]);
  const [schemeIndex, setSchemeIndex] = useState([]);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  // Try to load locally saved recommendations for lightweight search
  useEffect(() => {
    try {
      // Find any recommendations_* keys in localStorage
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('recommendations_'));
      let collected = [];
      keys.forEach((k) => {
        const arr = JSON.parse(localStorage.getItem(k) || '[]');
        if (Array.isArray(arr)) {
          collected = collected.concat(
            arr.map((r) => ({
              name: r.scheme_name,
              category: r.schemeCategory,
              level: r.level,
              details: r.details,
              benefits: r.benefits,
              eligibility: r.eligibility,
            }))
          );
        }
      });
      // Deduplicate by name
      const seen = new Set();
      const unique = [];
      for (const s of collected) {
        const key = (s.name || '').toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          unique.push(s);
        }
      }
      setSchemeIndex(unique.slice(0, 500)); // cap for perf
    } catch (e) {
      // ignore
    }
  }, []);

  const searchFAQs = (q) => {
    const query = q.toLowerCase();
    const scored = faqs
      .map((f) => {
        const hay = `${f.question} ${f.answer} ${f.tags?.join(' ') || ''}`.toLowerCase();
        const score =
          (hay.includes(query) ? 2 : 0) +
          (f.tags || []).reduce((acc, t) => acc + (query.includes(t.toLowerCase()) ? 1 : 0), 0) +
          // token overlap (simple)
          query
            .split(/\s+/)
            .filter((t) => t && hay.includes(t)).length;
        return { f, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.f);
    return scored;
  };

  const searchSchemes = (q) => {
    if (!q || !schemeIndex.length) return [];
    const query = q.toLowerCase();
    const results = schemeIndex
      .map((s) => {
        const hay = `${s.name} ${s.category} ${s.level} ${s.details} ${s.benefits} ${s.eligibility}`.toLowerCase();
        const nameBoost = (s.name || '').toLowerCase().includes(query) ? 3 : 0;
        const score =
          nameBoost +
          (hay.includes(query) ? 2 : 0) +
          query
            .split(/\s+/)
            .filter((t) => t && hay.includes(t)).length;
        return { s, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.s);
    return results;
  };

  const handleSend = (e) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q) return;

    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');

    // Answer from FAQs first, then scheme search
    const faqHits = searchFAQs(q);
    const schemeHits = searchSchemes(q);

    let reply = '';
    if (faqHits.length) {
      reply += `Here’s what I found in FAQs:\n\n`;
      faqHits.forEach((f, i) => {
        reply += `- ${f.question}\n  ${f.answer}\n\n`;
      });
    }

    if (schemeHits.length) {
      reply += (faqHits.length ? `Also, related schemes:\n\n` : `Related schemes:\n\n`);
      schemeHits.forEach((s) => {
        reply += `• ${s.name}\n`;
        if (s.details) reply += `  ${truncate(s.details)}\n`;
        if (s.eligibility) reply += `  Eligibility: ${truncate(s.eligibility)}\n`;
        reply += `\n`;
      });
    }

    if (!reply) {
      reply = `I couldn’t find a direct match. Try different words, or ask about “documents”, “eligibility”, or a scheme name.`;
    }

    setMessages((m) => [...m, { role: 'bot', text: reply }]);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const truncate = (txt, n = 180) => {
    if (!txt) return '';
    const t = String(txt);
    return t.length > n ? t.slice(0, n - 1) + '…' : t;
  };

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

          <div className="px-4 py-3 space-y-3 max-h-[50vh] overflow-y-auto">
            {messages.map((m, idx) => (
              <div key={idx} className={`${m.role === 'bot' ? 'text-gray-800 dark:text-gray-200' : 'text-gray-700 dark:text-gray-300'} whitespace-pre-line`}>
                {m.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about eligibility, documents, or a scheme name…"
              className="flex-1 form-input bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <button type="submit" className="btn btn-primary">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;



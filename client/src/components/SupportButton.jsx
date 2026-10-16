import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import api from '../lib/api';

export default function SupportButton() {
  const [link, setLink] = useState('https://t.me/MetaTradeSupportBot');

  useEffect(() => {
    let alive = true;
    api.get('/settings/public')
      .then(({ data }) => {
        if (alive && data?.support_telegram) {
          setLink(`https://t.me/${String(data.support_telegram).replace(/^@/, '')}`);
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with support on Telegram"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2"
    >
      <span className="hidden sm:block text-xs font-semibold bg-zinc-900 text-gold-500 border border-gold-500/40 shadow-md rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
        Chat with Support
      </span>
      <span className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/30 hover:shadow-gold-500/50 hover:scale-105 transition-all flex items-center justify-center">
        <Send className="w-6 h-6 text-white" />
      </span>
    </a>
  );
}
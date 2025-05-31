import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "/.netlify/functions/chat-gemini";
const OPENROUTER_MODEL = "google/gemini-2.5-pro-exp-03-25";

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const ChatGeminiAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Mensajes en formato OpenAI
  const getOpenAIMessages = () => {
    return messages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })).concat(input.trim() ? [{ role: 'user', content: input.trim() }] : []);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: getOpenAIMessages(),
        })
      });
      const data = await response.json();
      console.log('OpenRouter API response:', data);
      const aiText = data.choices?.[0]?.message?.content || 'Sin respuesta de modelo AI.';
      setMessages((prev) => [...prev, { sender: 'ai', text: aiText }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Error al conectar con OpenRouter.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none transition-colors duration-200"
          onClick={() => setOpen(true)}
          aria-label="Abrir chat AI"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
      {/* Ventana flotante de chat */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col h-[500px] border border-gray-200 dark:border-gray-700 animate-fade-in transition-colors duration-200">
          <div className="flex items-center justify-between p-3 border-b dark:border-gray-700 bg-blue-600 rounded-t-lg">
            <span className="text-white font-semibold">Asistente AI</span>
            <button 
              onClick={() => setOpen(false)} 
              className="text-white hover:text-gray-200 transition-colors duration-200"
              aria-label="Cerrar chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto mb-2 p-2 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-2 text-sm ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block px-2 py-1 rounded transition-colors duration-200 ${
                  msg.sender === 'user' 
                    ? 'bg-blue-200 dark:bg-blue-700 text-gray-800 dark:text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}>
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                Modelo AI está escribiendo...
              </div>
            )}
          </div>
          <div className="flex space-x-2 p-2 border-t dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg transition-colors duration-200">
            <input
              className="flex-1 border rounded p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors duration-200"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatGeminiAI; 
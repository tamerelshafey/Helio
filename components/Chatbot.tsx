import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { Language } from '../App';
import { translations } from '../data/translations';
import { propertiesData } from '../data/properties';
import { ChatIcon, CloseIcon, SendIcon } from './icons/Icons';

interface ChatbotProps {
  language: Language;
}

type Message = {
  sender: 'user' | 'bot';
  text: string;
};

const Chatbot: React.FC<ChatbotProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[language].chatbot;
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ sender: 'bot', text: t.greeting }]);
    }
  }, [isOpen, t.greeting, messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = (messageText || userInput).trim();
    if (!textToSend) return;

    const userMessage: Message = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const propertiesJSON = JSON.stringify(propertiesData.map(p => ({
        id: p.id,
        title: p.title[language],
        type: p.type[language],
        price: p.price[language],
        area: p.area,
        beds: p.beds,
        baths: p.baths,
        status: p.status[language],
        amenities: p.amenities[language],
      })), null, 2);

      const history = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      
      const systemInstruction = `You are HelioBot, a friendly and professional real estate assistant for the "ONLY HELIO" website, which specializes in properties and services in New Heliopolis, Egypt. Your goal is to help users find properties (for sale or rent), and get information about finishing and decoration services.

      - ALWAYS answer in ${language === 'ar' ? 'Arabic' : 'English'}.
      - Use the provided JSON data of current property listings to answer questions about available properties.
      - When recommending a property, mention its title and key features (price, area, beds) and its ID. Do not make up properties.
      - Be conversational and helpful.
      - Keep your answers concise and to the point.
      - Here is the current property listings available on the website:
      ${propertiesJSON}
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            ...history,
            { role: 'user', parts: [{ text: textToSend }] }
        ],
        config: {
            systemInstruction: systemInstruction,
        }
      });
      
      const botMessage: Message = { sender: 'bot', text: response.text };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error with Gemini API:", error);
      const errorMessage: Message = { sender: 'bot', text: t.error };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickReply = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 ${language === 'ar' ? 'left-6' : 'right-6'} bg-amber-500 text-gray-900 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-amber-600 transition-transform hover:scale-110 z-40 ${isOpen ? 'hidden' : 'block'}`}
        aria-label={t.title}
      >
        <ChatIcon className="w-8 h-8" />
      </button>

      {isOpen && (
        <div className={`fixed bottom-6 ${language === 'ar' ? 'left-6' : 'right-6'} w-[90vw] max-w-sm h-[70vh] max-h-[600px] flex flex-col bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 animate-fadeIn`}>
          <header className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900 rounded-t-xl">
            <h3 className="text-lg font-bold text-amber-500">{t.title}</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <CloseIcon className="w-6 h-6" />
            </button>
          </header>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? `justify-end ${language === 'ar' ? 'ml-auto' : 'mr-auto'}` : `justify-start ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-amber-500 text-gray-900 rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                  <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
                <div className={`flex justify-start mb-4 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
                    <div className="max-w-[80%] p-3 rounded-lg bg-gray-700 text-gray-200 rounded-bl-none">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
            )}
            {messages.length === 1 && !isLoading && (
                <div className={`flex gap-2 mt-2 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                    <button onClick={() => handleQuickReply(t.quickReply1)} className="text-xs border border-amber-500 text-amber-500 px-3 py-1 rounded-full hover:bg-amber-500/10 transition-colors">{t.quickReply1}</button>
                    <button onClick={() => handleQuickReply(t.quickReply2)} className="text-xs border border-amber-500 text-amber-500 px-3 py-1 rounded-full hover:bg-amber-500/10 transition-colors">{t.quickReply2}</button>
                </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-gray-700">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={t.placeholder}
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-white placeholder-gray-400"
                />
                <button type="submit" className="bg-amber-500 text-gray-900 p-2 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-600" disabled={isLoading || !userInput}>
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
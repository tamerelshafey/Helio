import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../services/properties';
import { useLanguage } from './shared/LanguageContext';
import { CloseIcon, SparklesIcon } from './icons/Icons';
import type { Property } from '../types';

interface Message {
    sender: 'user' | 'ai' | 'system';
    text: string;
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const { language } = useLanguage();
    const { data: properties } = useQuery({ 
        queryKey: ['allPropertiesForChatbot'], 
        queryFn: getProperties, 
        enabled: isOpen,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const propertyContext = useMemo(() => {
        if (!properties) return 'No properties are currently available.';
        const simplifiedProperties = properties.map(p => ({
            id: p.id,
            title: p.title[language],
            type: p.type[language],
            price: p.price[language],
            area: p.area,
            beds: p.beds,
            baths: p.baths,
        }));
        return `Here is the list of available properties in JSON format:\n\n${JSON.stringify(simplifiedProperties, null, 2)}`;
    }, [properties, language]);

    useEffect(() => {
        if (isOpen && properties) {
            const systemInstruction = `You are a friendly and helpful real estate assistant for 'ONLY HELIO', a company specializing in properties in New Heliopolis, Egypt. Your goal is to help users find properties based on their needs. Use the provided list of available properties to answer questions. Be concise, friendly, and helpful. Always respond in the user's language (which is currently ${language}). Do not invent properties. If you suggest a property, mention its title and ID clearly so the user can find it. ${propertyContext}`;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
                const chatSession = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    history: [
                        {
                            role: "user",
                            parts: [{ text: "System instruction" }],
                        },
                        {
                            role: "model",
                            parts: [{ text: "Ok, I am ready." }],
                        },
                         {
                            role: "user",
                            parts: [{ text: systemInstruction }],
                        },
                        {
                            role: "model",
                            parts: [{ text: language === 'ar' ? "مرحباً! أنا مساعدك العقاري. كيف يمكنني مساعدتك في العثور على عقار في هليوبوليس الجديدة اليوم؟" : "Hello! I'm your real estate assistant. How can I help you find a property in New Heliopolis today?" }],
                        },
                    ]
                });
                setChat(chatSession);
                if (messages.length === 0) {
                     setMessages([
                        { sender: 'ai', text: language === 'ar' ? "مرحباً! أنا مساعدك العقاري. كيف يمكنني مساعدتك في العثور على عقار في هليوبوليس الجديدة اليوم؟" : "Hello! I'm your real estate assistant. How can I help you find a property in New Heliopolis today?" }
                    ]);
                }
            } catch (error) {
                console.error("Error initializing Gemini Chat:", error);
                 setMessages([
                    { sender: 'ai', text: "Sorry, the AI assistant is currently unavailable." }
                ]);
            }
        }
    }, [isOpen, propertyContext, language, properties]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    useEffect(() => {
        if(isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen, messages]);

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const userInput = e.currentTarget.message.value.trim();
        if (!userInput || isLoading || !chat) return;

        const newMessages: Message[] = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setIsLoading(true);
        e.currentTarget.reset();

        try {
            const response = await chat.sendMessage({ message: userInput });
            setMessages([...newMessages, { sender: 'ai', text: response.text }]);
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages([...newMessages, { sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-amber-500 text-gray-900 rounded-full shadow-lg hover:bg-amber-600 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                aria-label="Open Chat Assistant"
            >
                <SparklesIcon className="h-8 w-8" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[900] flex items-end justify-end p-0 sm:p-6" role="dialog" aria-modal="true" onClick={() => setIsOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg shadow-2xl w-full h-[90vh] max-w-md flex flex-col transition-transform transform-gpu animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-amber-500" />
                                {language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close chat">
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </header>
                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl ${
                                        msg.sender === 'user' 
                                        ? 'bg-amber-500 text-gray-900 rounded-br-lg' 
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'
                                    }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0s]"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    name="message"
                                    type="text"
                                    placeholder={language === 'ar' ? 'اسأل عن العقارات...' : 'Ask about properties...'}
                                    autoComplete="off"
                                    className="flex-grow bg-gray-100 dark:bg-gray-700 border-transparent rounded-full px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    disabled={isLoading}
                                />
                                <button type="submit" disabled={isLoading} className="p-2 bg-amber-500 text-gray-900 rounded-full hover:bg-amber-600 disabled:opacity-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLineCap="round" strokeLineJoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </form>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
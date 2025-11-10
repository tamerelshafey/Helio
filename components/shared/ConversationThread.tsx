



import React, { useState, useRef, useEffect } from 'react';
import type { Lead, LeadMessage } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { inputClasses } from './FormField';
import { useToast } from './ToastContext';
import { addMessageToLead } from '../../api/leads';
import { useLanguage } from './LanguageContext';
import { Role } from '../../types';

interface ConversationThreadProps {
  lead: Lead;
  onMessageSent: () => void; // Callback to trigger refetch
}

const ConversationThread: React.FC<ConversationThreadProps> = ({ lead, onMessageSent }) => {
    const { language, t } = useLanguage();
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    const [newMessage, setNewMessage] = useState('');
    const [messageType, setMessageType] = useState<'message' | 'note'>('message');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lead.messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;
        
        setIsSending(true);
        try {
            const senderType = currentUser.role === Role.SUPER_ADMIN || currentUser.role.includes('_manager') ? 'admin' : 'partner';

            await addMessageToLead(lead.id, {
                sender: senderType,
                senderId: currentUser.id,
                type: messageType,
                content: newMessage,
            });
            setNewMessage('');
            onMessageSent(); // Trigger parent refetch
        } catch (error) {
            showToast('Failed to send message.', 'error');
        } finally {
            setIsSending(false);
        }
    };
    
    const isPartnerView = currentUser?.role.includes('PARTNER');
    const getSenderName = (message: LeadMessage) => {
        if (message.sender === 'client' || message.sender === 'system') return message.sender;
        if (message.senderId === currentUser?.id) return 'You';
        return message.sender;
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-b-lg flex flex-col gap-4">
             {(lead.contactTime || lead.customerNotes) && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 space-y-2">
                    {lead.contactTime && (
                         <div>
                            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">{t.dashboard.leadTable.contactTime}</p>
                            <p className="text-sm text-yellow-900 dark:text-yellow-200">{lead.contactTime}</p>
                        </div>
                    )}
                    {lead.customerNotes && (
                        <div>
                            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">{t.dashboard.leadTable.notes}</p>
                            <p className="text-sm text-yellow-900 dark:text-yellow-200 whitespace-pre-wrap">{lead.customerNotes}</p>
                        </div>
                    )}
                </div>
            )}
            <div className="flex-grow h-64 overflow-y-auto flex flex-col gap-3 p-2 bg-white dark:bg-gray-700/50 rounded-lg">
                {lead.messages.length === 0 ? (
                     <div className="text-center text-sm text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
                        No messages yet.
                     </div>
                ) : (
                    lead.messages.map(msg => (
                        <div 
                            key={msg.id}
                            className={`p-3 rounded-lg max-w-[80%] break-words
                                ${msg.type === 'note' ? 'chat-bubble-note' : ''}
                                ${msg.sender === 'partner' || msg.sender === 'admin' ? 'chat-bubble-sent' : 'chat-bubble-received'}
                            `}
                        >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs opacity-70 mt-1 ${msg.type === 'note' ? 'text-center' : (msg.sender === 'partner' || msg.sender === 'admin' ? 'text-right' : 'text-left')}`}>
                                {getSenderName(msg)} - {new Date(msg.timestamp).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit}>
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={messageType === 'message' ? 'Message to client...' : 'Internal note...'}
                    className={`${inputClasses} mb-2`}
                    rows={3}
                    disabled={isSending}
                />
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="messageType" value="message" checked={messageType === 'message'} onChange={() => setMessageType('message')} />
                            Message
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="messageType" value="note" checked={messageType === 'note'} onChange={() => setMessageType('note')} />
                            Internal Note
                        </label>
                    </div>
                    <button type="submit" disabled={isSending || !newMessage.trim()} className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
                        {isSending ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConversationThread;

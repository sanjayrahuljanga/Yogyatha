import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import Icon from './Icons';
import { Scheme } from '../types';
import { geminiService } from '../services/geminiService';

interface AiAssistantProps {
    schemesContext: Scheme[];
}

type Message = {
    role: 'user' | 'ai' | 'system';
    content: string;
};

const AiAssistant: React.FC<AiAssistantProps> = ({ schemesContext }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'system', content: t('aiAssistantWelcome') }]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await geminiService.getAiAnswer(input, schemesContext);
            const aiMessage: Message = { role: 'ai', content: aiResponse };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = { role: 'ai', content: "Sorry, I couldn't connect to the AI service right now." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const bubbleClasses = {
        user: 'bg-teal-600 text-white self-end',
        ai: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 self-start',
        system: 'bg-transparent text-slate-500 dark:text-slate-400 text-center text-sm self-center',
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] max-w-sm h-[60vh] max-h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700 z-50"
                    >
                        <header className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Icon icon="sparkles" className="w-6 h-6 text-teal-500" />
                                <h3 className="font-bold text-slate-800 dark:text-slate-100">{t('aiAssistantTitle')}</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <Icon icon="x-mark" className="w-5 h-5" />
                            </button>
                        </header>
                        <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-3 rounded-lg max-w-[85%] text-sm ${bubbleClasses[msg.role]}`}
                                >
                                    {msg.content}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-3 rounded-lg max-w-[85%] text-sm italic ${bubbleClasses.ai}`}
                                >
                                    {t('aiAssistantThinking')}
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={t('aiAssistantPlaceholder')}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="p-2.5 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed transition"
                            >
                                <Icon icon="paper-airplane" className="w-5 h-5" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 sm:right-6 z-50 p-4 bg-teal-600 text-white rounded-full shadow-2xl hover:bg-teal-700 transition"
                aria-label={t('aiAssistantTitle')}
            >
                <Icon icon={isOpen ? "x-mark" : "chat-bubble-left-right"} className="w-8 h-8" />
            </motion.button>
        </>
    );
};

export default AiAssistant;

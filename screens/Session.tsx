
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { createPsychoanalysisSession, getSessionSummaryAndTitle } from '../services/geminiService';
import { Loader2, Send, History, ChevronDown, MessageSquare } from 'lucide-react';
import type { Chat } from '@google/genai';

type Message = { role: 'user' | 'model'; text: string };

const SESSION_DURATION = 40 * 60; // 40 minutes in seconds

const SessionHistory = ({ onBack }: { onBack: () => void }) => {
    const { userData } = useUser();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

    return (
        <div className="max-w-4xl mx-auto animate-message-fade-in">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold font-serif text-text-primary">Session History</h1>
                    <p className="text-lg text-text-secondary mt-2">Review your past conversations.</p>
                </div>
                <button onClick={onBack} className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary/90">Back to Session</button>
            </header>
            <div className="space-y-4">
                {userData.sessions.length === 0 ? <p className="text-text-secondary">No completed sessions yet.</p> :
                userData.sessions.map(s => (
                    <div key={s.id} className="bg-surface rounded-lg shadow-sm overflow-hidden">
                        <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)} className="w-full text-left p-4 flex justify-between items-center hover:bg-white/5">
                            <div>
                                <h3 className="font-bold text-lg text-primary">{s.title}</h3>
                                <p className="text-sm text-text-secondary">{new Date(s.startDate).toLocaleString()}</p>
                            </div>
                            <ChevronDown size={20} className={`transition-transform duration-300 ${expandedId === s.id ? 'rotate-180' : ''}`} />
                        </button>
                        <div
                            ref={el => contentRefs.current[s.id] = el}
                            className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                            style={{ maxHeight: expandedId === s.id ? `${contentRefs.current[s.id]?.scrollHeight}px` : '0px' }}
                        >
                            <div className="p-4 border-t border-text-primary/10">
                                <p className="text-text-primary italic">{s.summary}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Session: React.FC = () => {
    const { addSession } = useUser();
    const [chat, setChat] = useState<Chat | null>(null);
    const [conversation, setConversation] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionActive, setSessionActive] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
    const [showHistory, setShowHistory] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<number>();

    useEffect(() => {
        if (sessionActive) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        endSession();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [sessionActive]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const startSession = async () => {
        const newChat = createPsychoanalysisSession();
        setChat(newChat);
        setSessionActive(true);
        setIsLoading(true);
        const initialResponse = await newChat.sendMessage({ message: "Hello." });
        setConversation([{ role: 'model', text: initialResponse.text }]);
        setIsLoading(false);
    };

    const endSession = async () => {
        if (conversation.length > 1) {
            const { title, summary } = await getSessionSummaryAndTitle(conversation);
            const newSession = {
                id: Date.now().toString(),
                startDate: new Date(Date.now() - (SESSION_DURATION - timeRemaining) * 1000).toISOString(),
                endDate: new Date().toISOString(),
                title,
                summary,
                conversation,
            };
            addSession(newSession);
        }
        if (timerRef.current) clearInterval(timerRef.current);
        setSessionActive(false);
        setConversation([]);
        setTimeRemaining(SESSION_DURATION);
        setChat(null);
    };

    const handleSend = async () => {
        if (!input.trim() || !chat) return;
        const userMessage: Message = { role: 'user', text: input };
        setConversation(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: input });
            setConversation(prev => [...prev, { role: 'model', text: response.text }]);
        } catch (error) {
            console.error(error);
            setConversation(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    if (showHistory) {
        return <SessionHistory onBack={() => setShowHistory(false)} />;
    }

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold font-serif text-text-primary">AI Guided Session</h1>
                    <p className="text-lg text-text-secondary mt-2">A 40-minute safe space for deep reflection.</p>
                </div>
                <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 bg-surface text-text-secondary px-4 py-2 rounded-lg hover:bg-white/5">
                    <History size={18} /> History
                </button>
            </header>

            {!sessionActive ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-surface p-8 rounded-lg shadow-lg text-center">
                    <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                        <MessageSquare size={48} className="text-secondary" />
                    </div>
                    <h2 className="text-2xl font-semibold">Begin your session?</h2>
                    <p className="text-text-secondary mt-2 max-w-md">Find a quiet, comfortable space where you can speak freely and without interruption for the next 40 minutes.</p>
                    <button onClick={startSession} className="mt-6 bg-secondary text-white font-bold px-8 py-3 rounded-full text-lg hover:bg-secondary/90 transition-transform transform hover:scale-105">
                        Start 40-Minute Session
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col bg-surface rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-text-primary/10 flex justify-between items-center">
                        <span className="font-semibold text-lg text-primary">{formatTime(timeRemaining)}</span>
                        <button onClick={endSession} className="bg-accent/80 text-white font-semibold px-4 py-1 rounded-lg text-sm hover:bg-accent">End Session</button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        {conversation.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-fade-in`}>
                                <div className={`max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-base text-text-primary'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-message-fade-in">
                                <div className="bg-base text-text-primary px-4 py-2 rounded-2xl flex items-center">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Typing...
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-text-primary/10 bg-base/50">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                placeholder="Type your message..."
                                className="flex-1 p-2 border border-text-primary/20 rounded-lg bg-surface focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-shadow"
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading} className="p-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:bg-secondary/50">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Session;

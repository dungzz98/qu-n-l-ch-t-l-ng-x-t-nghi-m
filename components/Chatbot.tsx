import React, { useState, useEffect, useRef } from 'react';
import { SendIcon } from './icons/SendIcon';
import { SparklesIcon } from './icons/SparklesIcon';

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    onSendQuery: (query: string) => void;
    history: ChatMessage[];
    isLoading: boolean;
}

const SamplePrompts = ({ onPromptClick }: { onPromptClick: (prompt: string) => void }) => {
    const prompts = [
        "Hóa chất nào sắp hết hạn?",
        "Tạo báo cáo tồn kho tổng hợp",
        "Tóm tắt tình trạng thiết bị",
        "Liệt kê nhân sự phòng Huyết học",
    ];

    return (
        <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-500 mb-2">Gợi ý cho bạn:</h3>
            <div className="flex flex-wrap gap-2">
                {prompts.map(prompt => (
                    <button
                        key={prompt}
                        onClick={() => onPromptClick(prompt)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300 transition-colors"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Simple markdown to HTML renderer
const renderMarkdown = (text: string) => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-200 p-2 rounded-md text-sm whitespace-pre-wrap font-mono my-2">$1</pre>') // Code blocks
        .replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc">$1</li>'); // List items

    // Wrap list items in <ul>
    if (html.includes('<li')) {
        html = `<ul>${html}</ul>`.replace(/<\/li>(\s*)<ul>/g, '</li>').replace(/<\/ul>(\s*)<li/g, '</li><li');
    }
    
    return { __html: html };
};


const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, onSendQuery, history, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);
    
    if (!isOpen) return null;
    
    const handleSend = () => {
        if (input.trim()) {
            onSendQuery(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-40 flex justify-center items-center" onClick={onClose}>
            <div
                className="fixed bottom-20 right-5 w-full max-w-lg h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 ease-out"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-lg font-bold text-slate-800">Trợ lý AI Lab</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </header>
                
                <main className="flex-1 overflow-y-auto p-4 space-y-4">
                    {history.length === 0 && <SamplePrompts onPromptClick={(p) => { setInput(p); onSendQuery(p); }} />}

                    {history.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'chat-bubble-user rounded-br-none' : 'chat-bubble-ai rounded-bl-none'}`}>
                                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={renderMarkdown(msg.parts[0].text)} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="chat-bubble-ai p-3 rounded-lg rounded-bl-none">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>
                
                <footer className="p-4 border-t">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Hỏi trợ lý AI..."
                            className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            onClick={handleSend}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300"
                            disabled={isLoading || !input.trim()}
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Chatbot;

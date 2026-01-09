import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, MessageSquare } from 'lucide-react';
import { ChatMessage, AnalysisResult } from '../types';
import { chatWithRoleCoach } from '../services/gemini';

interface RoleCoachProps {
  analysis: AnalysisResult | null;
  jobTitle: string;
}

const RoleCoach: React.FC<RoleCoachProps> = ({ analysis, jobTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: "Hi! I'm RoleCoach. Once you scan a resume, I can help you create a personalized plan to land the job.", 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (analysis) {
      setMessages(prev => [
        ...prev,
        {
          id: `analysis-${Date.now()}`,
          role: 'model',
          text: `I've analyzed the resume for "${jobTitle}". You have a ${analysis.matchScore}% match. I found ${analysis.missingSkills.length} key gaps. Want to build a roadmap?`,
          timestamp: Date.now()
        }
      ]);
      setIsOpen(true);
    }
  }, [analysis, jobTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await chatWithRoleCoach(messages, input, { jobTitle, analysis: analysis || undefined });
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_30px_rgba(77,124,255,0.4)] hover:scale-110 transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20"></div>
          <Bot className="h-7 w-7" />
          {analysis && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-black">1</span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[90vw] md:w-[400px] h-[550px] flex flex-col glass-panel rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up border border-white/10 bg-[#020617]/90 backdrop-blur-2xl mb-[-70px] md:mb-0">
          {/* Header */}
          <div className="flex items-center justify-between bg-white/5 p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">RoleCoach AI</h3>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none shadow-lg shadow-primary/20' 
                      : 'bg-white/10 text-slate-200 rounded-bl-none border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            {analysis && messages.length < 3 && (
               <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar">
                 {['Create a roadmap', 'How do I improve?', 'Explain my gaps'].map(suggestion => (
                   <button 
                     key={suggestion} 
                     onClick={() => { setInput(suggestion); handleSend(); }}
                     className="whitespace-nowrap px-3 py-1.5 rounded-full bg-primarySoft border border-primary/30 text-xs text-blue-200 hover:bg-primary/20 transition-colors"
                   >
                     {suggestion}
                   </button>
                 ))}
               </div>
            )}
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask RoleCoach..."
                className="flex-1 glass-input rounded-full px-5 py-3 pr-12 text-sm focus:ring-1 focus:ring-primary"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-1.5 p-2 rounded-full bg-primary text-white hover:bg-primary/80 disabled:opacity-50 disabled:hover:bg-primary transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleCoach;
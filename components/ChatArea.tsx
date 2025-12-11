import React, { useEffect, useRef, useState } from 'react';
import { Contact, Message, User } from '../types';
import { Send, Image as ImageIcon, ArrowLeft, Bot, Sparkles, User as UserIcon } from 'lucide-react';

interface ChatAreaProps {
  currentUser: User;
  contact: Contact;
  messages: Message[];
  onSendMessage: (content: string, type: 'text' | 'image') => void;
  onBack: () => void;
  isAiThinking?: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  currentUser,
  contact,
  messages,
  onSendMessage,
  onBack,
  isAiThinking = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim(), 'text');
      setInputValue('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] relative">
      {/* Header */}
      <div className="h-16 flex items-center px-4 bg-white border-b border-gray-200 shadow-sm z-10 shrink-0">
        <button onClick={onBack} className="md:hidden mr-3 p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        
        <div className="relative">
            {contact.isAi ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <Bot size={20} />
                </div>
            ) : (
                <img 
                    src={`https://picsum.photos/seed/${contact.email}/200/200`} 
                    alt={contact.name} 
                    className="w-10 h-10 rounded-full object-cover"
                />
            )}
        </div>
        
        <div className="ml-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-1">
            {contact.name}
            {contact.isAi && <Sparkles size={14} className="text-yellow-500 fill-yellow-500" />}
          </h2>
          <p className="text-xs text-gray-500">
             {contact.email}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-xs text-gray-400 my-4">
            <span>与 {contact.name} 的聊天开始</span>
        </div>
        
        {messages.map((msg) => {
          const isSelf = msg.senderEmail === currentUser.email;
          return (
            <div 
              key={msg.id} 
              className={`flex ${isSelf ? 'justify-end' : 'justify-start'} group`}
            >
              {!isSelf && (
                 <div className="mr-2 flex-shrink-0 self-end">
                     {contact.isAi ? (
                         <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white">
                             <Bot size={14} />
                         </div>
                     ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                             <img src={`https://picsum.photos/seed/${contact.email}/100/100`} className="w-full h-full object-cover" />
                        </div>
                     )}
                 </div>
              )}

              <div className={`max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-2 shadow-sm text-sm whitespace-pre-wrap break-words ${
                isSelf 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
              }`}>
                {msg.content}
                <div className={`text-[10px] mt-1 text-right opacity-70 ${isSelf ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isAiThinking && (
            <div className="flex justify-start">
                 <div className="mr-2 flex-shrink-0 self-end">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white animate-pulse">
                         <Bot size={14} />
                     </div>
                 </div>
                 <div className="bg-white text-gray-500 rounded-2xl rounded-bl-none border border-gray-100 px-4 py-3 shadow-sm flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <div className="flex items-end space-x-2 max-w-4xl mx-auto">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
            <ImageIcon size={24} />
          </button>
          
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="发送消息..."
              className="w-full bg-transparent border-none outline-none resize-none max-h-32 py-1 text-sm text-gray-800 placeholder-gray-400 scrollbar-hide"
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full shadow-md transition-all transform active:scale-95 flex items-center justify-center"
          >
            <Send size={20} className={inputValue.trim() ? 'ml-0.5' : ''} />
          </button>
        </div>
        <div className="text-center text-[10px] text-gray-400 mt-2">
            按 Enter 发送，Shift + Enter 换行
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
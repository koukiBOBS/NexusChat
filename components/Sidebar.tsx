import React from 'react';
import { User, Contact } from '../types';
import { LogOut, Plus, Search, MessageSquare, Bot } from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  contacts: Contact[];
  activeContactId: string | null;
  onSelectContact: (email: string) => void;
  onAddContact: () => void;
  onLogout: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  contacts,
  activeContactId,
  onSelectContact,
  onAddContact,
  onLogout,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-3">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-full bg-gray-300 object-cover border-2 border-white shadow-sm"
            />
            <div>
                <h2 className="font-semibold text-gray-800 text-sm">{currentUser.name}</h2>
                <p className="text-xs text-green-600 font-medium">在线</p>
            </div>
        </div>
        <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors p-2" title="退出登录">
            <LogOut size={18} />
        </button>
      </div>

      {/* Search & Add */}
      <div className="p-4 space-y-3">
        <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="搜索联系人..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg text-sm transition-all outline-none"
            />
        </div>
        <button 
            onClick={onAddContact}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
            <Plus size={16} />
            <span>添加新联系人</span>
        </button>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 pb-2">
            {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                    <p>没有找到联系人</p>
                </div>
            ) : (
                filteredContacts.map(contact => (
                    <div 
                        key={contact.email}
                        onClick={() => onSelectContact(contact.email)}
                        className={`flex items-center p-3 mb-1 rounded-xl cursor-pointer transition-colors ${
                            activeContactId === contact.email 
                            ? 'bg-blue-50 border-l-4 border-blue-500' 
                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}
                    >
                        <div className="relative">
                            {contact.isAi ? (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                                    <Bot size={24} />
                                </div>
                            ) : (
                                <img 
                                    src={`https://picsum.photos/seed/${contact.email}/200/200`} 
                                    alt={contact.name} 
                                    className="w-12 h-12 rounded-full object-cover bg-gray-200"
                                />
                            )}
                            {contact.email === currentUser.email && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white" title="发送给自己">
                                   <MessageSquare size={10} />
                                </div>
                            )}
                        </div>
                        
                        <div className="ml-3 flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className={`text-sm font-semibold truncate ${activeContactId === contact.email ? 'text-blue-700' : 'text-gray-900'}`}>
                                    {contact.name}
                                </h3>
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                    {formatTime(contact.lastMessage?.timestamp)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate h-4">
                                {contact.lastMessage ? contact.lastMessage.content : <span className="text-gray-300 italic">开始聊天...</span>}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
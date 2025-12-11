import React, { useEffect, useState } from 'react';
import { User, Contact, Message, AI_USER_EMAIL } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import AddContactModal from './components/AddContactModal';
import { v4 as uuidv4 } from 'uuid'; // Since we can't use uuid package in this environment without full npm, we'll create a simple generator
// But wait, the environment allows standard libs. I will implement a simple UUID gen to be safe and dependency-free for this snippet.

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Initialize
  useEffect(() => {
    const user = storageService.getCurrentUser();
    if (user) {
      handleLogin(user);
    }
  }, []);

  // Update contacts whenever messages change or user logs in
  const refreshContacts = (userEmail: string) => {
    const list = storageService.getContactsForUser(userEmail);
    setContacts(list);
  };

  const handleLogin = (user: User) => {
    storageService.setCurrentUser(user);
    // Ensure self exists in users DB
    if (!storageService.getUser(user.email)) {
        storageService.saveUser(user);
    }
    setCurrentUser(user);
    refreshContacts(user.email);
  };

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setCurrentUser(null);
    setActiveContactId(null);
    setContacts([]);
  };

  const handleSelectContact = (email: string) => {
    setActiveContactId(email);
    if (currentUser) {
      const msgs = storageService.getConversation(currentUser.email, email);
      setCurrentMessages(msgs);
    }
  };

  const handleSendMessage = async (content: string, type: 'text' | 'image') => {
    if (!currentUser || !activeContactId) return;

    const newMessage: Message = {
      id: generateId(),
      senderEmail: currentUser.email,
      receiverEmail: activeContactId,
      content,
      timestamp: Date.now(),
      type
    };

    storageService.saveMessage(newMessage);
    
    // Update local state immediately
    setCurrentMessages(prev => [...prev, newMessage]);
    refreshContacts(currentUser.email);

    // AI Logic
    if (activeContactId === AI_USER_EMAIL) {
        setIsAiThinking(true);
        // Prepare history for AI
        // AI expects User/Model roles. 
        // Our 'currentUser' is the user, AI_USER_EMAIL is the model.
        const history = [...currentMessages, newMessage].map(m => ({
            role: m.senderEmail === currentUser.email ? 'user' as const : 'model' as const,
            text: m.content
        }));

        try {
            const responseText = await geminiService.generateResponse(history);
            
            const aiMessage: Message = {
                id: generateId(),
                senderEmail: AI_USER_EMAIL,
                receiverEmail: currentUser.email,
                content: responseText,
                timestamp: Date.now(),
                type: 'text'
            };

            storageService.saveMessage(aiMessage);
            setCurrentMessages(prev => [...prev, aiMessage]);
            refreshContacts(currentUser.email);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAiThinking(false);
        }
    }
  };

  const handleAddContact = (email: string, name: string) => {
    if (!currentUser) return;
    
    // Create the user in the "DB" if they don't exist
    const existing = storageService.getUser(email);
    if (!existing) {
        storageService.saveUser({ email, name, avatar: undefined });
    }
    
    // Simulate a "Hello" message to initialize conversation link so they appear in list
    // Or we could just rely on the contact list logic.
    // For this app's logic (contacts based on messages), we might need to send a system message or just 
    // force add them to the UI state?
    // Let's force a system message "Added to contacts" which is hidden or just a dummy empty message?
    // Better: Send a "Hello" message from self to them? No, that's weird.
    // Let's just create a dummy "draft" message logic or simplest:
    // Just save the user. The Sidebar uses `getContactsForUser` which scans messages.
    // If we want them to appear BEFORE messaging, we need a separate "Friends List" in storage.
    // For simplicity, let's just send a local "Starting conversation" event.
    // Hack for demo: Send a message from Self to Friend saying "Added to contacts".
    
    // OR: Just navigate to them immediately.
    setActiveContactId(email);
    setCurrentMessages([]); // Empty start
    
    // We need to manually add to contact list for now until a message is sent
    const newContact: Contact = {
        email, 
        name, 
        unreadCount: 0, 
        isAi: false 
    };
    
    // Check if already in contacts to avoid dupes visually until refresh
    if (!contacts.find(c => c.email === email)) {
        setContacts(prev => [newContact, ...prev]);
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const activeContact = contacts.find(c => c.email === activeContactId) || 
    (activeContactId ? storageService.getUser(activeContactId) as unknown as Contact : null) || 
    (activeContactId ? { email: activeContactId, name: activeContactId, unreadCount: 0 } as Contact : null);

  // Fix up the active contact object structure if it came from raw User
  if (activeContact && !('unreadCount' in activeContact)) {
     (activeContact as Contact).unreadCount = 0;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
        <AddContactModal 
            isOpen={isAddContactOpen} 
            onClose={() => setIsAddContactOpen(false)} 
            onAdd={handleAddContact} 
        />

        {/* Sidebar - Hidden on mobile if chat is active */}
        <Sidebar 
            className={`w-full md:w-80 flex-shrink-0 ${activeContactId ? 'hidden md:flex' : 'flex'}`}
            currentUser={currentUser}
            contacts={contacts}
            activeContactId={activeContactId}
            onSelectContact={handleSelectContact}
            onAddContact={() => setIsAddContactOpen(true)}
            onLogout={handleLogout}
        />

        {/* Chat Area - Full screen on mobile if active, otherwise hidden/placeholder */}
        <main className={`flex-1 h-full flex flex-col min-w-0 ${!activeContactId ? 'hidden md:flex' : 'flex'}`}>
            {activeContactId && activeContact ? (
                <ChatArea 
                    currentUser={currentUser}
                    contact={activeContact}
                    messages={currentMessages}
                    onSendMessage={handleSendMessage}
                    onBack={() => setActiveContactId(null)}
                    isAiThinking={isAiThinking}
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400 select-none">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
                    <p className="text-lg font-medium">选择一个联系人开始聊天</p>
                    <p className="text-sm mt-2">NexusChat - 连接无界</p>
                </div>
            )}
        </main>
    </div>
  );
};

export default App;
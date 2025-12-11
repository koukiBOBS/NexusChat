import { Message, User, Contact, AI_USER_EMAIL, AI_USER_NAME } from '../types';

const USERS_KEY = 'nexus_users';
const MESSAGES_KEY = 'nexus_messages';
const CURRENT_USER_KEY = 'nexus_current_user';

// Mock initial data
const INITIAL_USERS: Record<string, User> = {
  [AI_USER_EMAIL]: { email: AI_USER_EMAIL, name: AI_USER_NAME, avatar: 'https://picsum.photos/id/20/200/200' }
};

export const storageService = {
  saveUser: (user: User) => {
    const users = storageService.getUsers();
    users[user.email] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getUsers: (): Record<string, User> => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : { ...INITIAL_USERS };
  },

  getUser: (email: string): User | undefined => {
    return storageService.getUsers()[email];
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      storageService.saveUser(user);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  getMessages: (): Message[] => {
    const stored = localStorage.getItem(MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveMessage: (message: Message) => {
    const messages = storageService.getMessages();
    messages.push(message);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  },

  // Get conversation between two users (or self)
  getConversation: (emailA: string, emailB: string): Message[] => {
    const messages = storageService.getMessages();
    return messages.filter(m => 
      (m.senderEmail === emailA && m.receiverEmail === emailB) ||
      (m.senderEmail === emailB && m.receiverEmail === emailA)
    ).sort((a, b) => a.timestamp - b.timestamp);
  },

  // Generate a contact list for a specific user based on message history and added users
  getContactsForUser: (currentUserEmail: string): Contact[] => {
    const allUsers = storageService.getUsers();
    const allMessages = storageService.getMessages();
    
    // Identify who this user has talked to
    const contactEmails = new Set<string>();
    
    // Always include AI
    contactEmails.add(AI_USER_EMAIL);
    
    // Include self (Note to self)
    contactEmails.add(currentUserEmail);

    allMessages.forEach(m => {
      if (m.senderEmail === currentUserEmail) contactEmails.add(m.receiverEmail);
      if (m.receiverEmail === currentUserEmail) contactEmails.add(m.senderEmail);
    });

    // Also include manually added contacts if we had a separate list, 
    // for now we just use the user list as the "directory" if they have chatted.
    // In a real app, we'd have a specific "friends list". 
    // Let's just return everyone we know about for simplicity in this demo, 
    // excluding randoms if the user hasn't added them? 
    // To simplify: we return everyone in the 'users' map except the current user (unless it's self-chat).
    
    const contacts: Contact[] = [];

    Object.values(allUsers).forEach(u => {
      // Find last message
      const conversation = storageService.getConversation(currentUserEmail, u.email);
      const lastMsg = conversation[conversation.length - 1];
      
      contacts.push({
        email: u.email,
        name: u.email === currentUserEmail ? `${u.name} (自己)` : u.name,
        lastMessage: lastMsg,
        unreadCount: 0, // Simplified for this demo
        isAi: u.email === AI_USER_EMAIL
      });
    });

    return contacts.sort((a, b) => {
        // Sort by last message time, fallback to name
        const timeA = a.lastMessage?.timestamp || 0;
        const timeB = b.lastMessage?.timestamp || 0;
        return timeB - timeA; 
    });
  }
};
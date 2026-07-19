import { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const ChatContext = createContext();
const socket = io('http://localhost:5000');

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export function ChatProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Admin Room သို့ ဝင်ရောက်ခြင်း
    socket.emit('join_admin_room');

    // New message ရောက်လာရင် နားထောင်ခြင်း
    socket.on('new_message', (data) => {
      // Message အသစ်ရောက်လာရင် Unread Count ကို တိုးမယ်
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off('new_message');
    };
  }, []);

  // Unread Count ကို Reset လုပ်ခြင်း (Admin က ကြည့်လိုက်တဲ့အခါ)
  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return (
    <ChatContext.Provider value={{ unreadCount, resetUnreadCount }}>
      {children}
    </ChatContext.Provider>
  );
}
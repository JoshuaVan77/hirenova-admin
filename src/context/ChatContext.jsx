import { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

// ✅ 1. Dynamic Socket URL (Production Ready)
// VITE_API_URL မရှိရင်တောင် localhost ကို Fallback အနေနဲ့ ပြန်သုံးပေးထားပါတယ်
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ✅ 2. Initialize Socket with better reliability settings
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], // WebSocket မရရင် Polling ကို အလိုအလျောက် ပြောင်းသုံးမယ်
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

const ChatContext = createContext();

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
    const handleNewMessage = (data) => {
      // Message အသစ်ရောက်လာရင် Unread Count ကို တိုးမယ်
      setUnreadCount(prev => prev + 1);
    };

    socket.on('new_message', handleNewMessage);

    // Cleanup function (Component unmount ဖြစ်ရင် Event listener ကို ဖျက်မယ်)
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, []);

  // Unread Count ကို Reset လုပ်ခြင်း (Admin က ကြည့်လိုက်တဲ့အခါ)
  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return (
    <ChatContext.Provider value={{ unreadCount, resetUnreadCount, socket }}>
      {children}
    </ChatContext.Provider>
  );
}
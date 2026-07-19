import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Send, MessageCircle, User, RefreshCw } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const API_URL = 'http://localhost:5000/api/chat';
const socket = io('http://localhost:5000');

export default function LiveChat() {
  const { resetUnreadCount } = useChat();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/conversations`);
      const mapped = response.data.conversations.map(c => ({
        id: c.user_id,
        user_name: c.full_name || 'Unknown User',
        user_phone: c.phone,
        status: 'active',
        last_message: c.last_message,
        last_time: new Date(c.last_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: c.unread_count
      }));
      setConversations(mapped);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    socket.emit('join_admin_room');

    socket.on('new_message', (data) => {
      fetchConversations();
      if (selectedConversation && selectedConversation.id === data.userId) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    });

    return () => socket.off('new_message');
  }, [selectedConversation]);

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/messages/${userId}`);
      setMessages(response.data.messages || []);
      
      // ✅ Backend ကို mark as read လုပ်ခိုင်းမယ်
      await axios.post(`${API_URL}/mark-read`, { userId });
      
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectConversation = (conv) => {
    // ✅ ၁။ Global unread count ကို ချက်ချင်း reset လုပ်မယ်
    resetUnreadCount();
    
    // ✅ ၂။ Local state မှာလည်း ဒီ conversation ရဲ့ badge ကို ချက်ချင်း ဖျက်မယ်
    setConversations(prev => 
      prev.map(c => 
        c.id === conv.id ? { ...c, unread: 0 } : c
      )
    );
    
    // ✅ ။ Conversation ကို select လုပ်မယ်
    setSelectedConversation(conv);
    
    // ✅ ၄။ Messages ကို ဆွဲမယ် (အဲဒီထဲမှာ mark as read ပါ ပါမယ်)
    fetchMessages(conv.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    const tempMsg = { id: Date.now(), sender: 'admin', message: message, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setMessage('');

    try {
      await axios.post(`${API_URL}/reply`, { userId: selectedConversation.id, message: message });
    } catch (error) {
      console.error('Error sending reply:', error);
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      alert('Failed to send message');
    }
  };

  const activeConversations = conversations.filter(c => c.status === 'active');

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-4">Live Chat Support</h2>
      
      <div className="flex flex-1 bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
        
        {/* 1. Conversations List */}
        <div className="w-72 border-r border-gray-800 flex flex-col bg-dark-bg flex-shrink-0">
          <div className="p-3 border-b border-gray-800 flex justify-between items-center">
            <span className="font-semibold text-white flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-brand-secondary" /> Conversations
            </span>
            <button onClick={() => { setIsRefreshing(true); fetchConversations(); setTimeout(() => setIsRefreshing(false), 800); }} className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded">
              <RefreshCw className={`h-4 w-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {activeConversations.length === 0 ? (
              <p className="text-center text-gray-500 text-xs mt-8">No active conversations</p>
            ) : (
              activeConversations.map((conv) => (
                <button 
                  key={conv.id} 
                  onClick={() => handleSelectConversation(conv)} 
                  className={`w-full text-left p-3 rounded-lg transition-colors relative ${
                    selectedConversation?.id === conv.id 
                      ? 'bg-brand-primary/20 border border-brand-secondary/30' 
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  {/* ✅ Badge - unread > 0 မှသာ ပြမယ် */}
                  {conv.unread > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full text-[10px]">
                      {conv.unread}
                    </span>
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-white text-sm truncate pr-2">{conv.user_name}</span>
                    <span className="text-xs text-gray-500">{conv.last_time}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{conv.last_message || 'No messages'}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 2. Chat Area */}
        <div className="flex-1 flex flex-col bg-dark-bg min-w-0">
          {selectedConversation ? (
            <>
              <div className="border-b border-gray-800 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{selectedConversation.user_name}</h3>
                  <p className="text-xs text-gray-400">{selectedConversation.user_phone}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-xl px-3 py-2 ${msg.sender === 'admin' ? 'bg-brand-primary text-white' : 'bg-gray-800 text-gray-200'}`}>
                      {msg.message && <p className="text-sm">{msg.message}</p>}
                      <p className="text-[10px] mt-1 text-right opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-800 p-4 bg-dark-card">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    placeholder="Type your reply..." 
                    className="flex-1 bg-dark-input border border-gray-700 rounded-full py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary" 
                  />
                  <button type="submit" disabled={!message.trim()} className="bg-brand-secondary text-white p-2 rounded-full hover:bg-brand-primary transition-colors disabled:opacity-50">
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-16 w-16 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-bold text-white mb-2">No Conversation Selected</p>
                <p className="text-sm">Select a user from the left panel to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
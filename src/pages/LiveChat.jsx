import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, MessageCircle, User, RefreshCw, AlertCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';

// ✅ Dynamic URLs
const BASE_URL = import.meta.env.VITE_API_URL || 'https://hirenova-backend-production-32b1.up.railway.app';
const API_URL = `${BASE_URL}/api/chat`;

export default function LiveChat() {
  const { resetUnreadCount, socket } = useChat();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // ✅ Helper function to get Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };
  };

  // ✅ Helper function to format Image URL
  const getFullImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanImg = img.startsWith('/') ? img : `/${img}`;
    return `${cleanBase}${cleanImg}`;
  };

  const fetchConversations = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/conversations`, getAuthHeaders());
      const mapped = response.data.conversations.map(c => ({
        id: c.user_id,
        conversation_id: c.conversation_id,
        user_name: c.full_name || 'Unknown User',
        user_phone: c.phone,
        status: c.status || 'active',
        last_message: c.last_message,
        last_time: new Date(c.last_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: c.unread_count
      }));
      setConversations(mapped);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (error.response?.status === 404) {
        setError('API endpoint not found. Please check VITE_API_URL in Vercel settings.');
      } else {
        setError('Failed to load conversations.');
      }
    }
  };

  useEffect(() => {
    fetchConversations();

    // ✅ Socket Listener မှာ Image Field ပါအောင် ထည့်သွင်းထားသည်
    const handleNewMessage = (data) => {
      fetchConversations(); 
      if (selectedConversation && selectedConversation.id === data.userId) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, {
            id: data.message.id,
            sender_type: data.message.sender_type,
            content: data.message.content,
            image_url: data.message.image_url || data.message.imageUrl || data.message.image || null,
            created_at: data.message.created_at
          }];
        });
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [selectedConversation, socket]);

  const fetchMessages = async (userId) => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/messages/${userId}`, getAuthHeaders());
      setMessages(response.data.messages || []);
      
      await axios.post(`${API_URL}/mark-read`, { userId }, getAuthHeaders());
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages.');
    }
  };

  const handleSelectConversation = (conv) => {
    resetUnreadCount();
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
    setSelectedConversation(conv);
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

    const tempMsg = { 
      id: Date.now(), 
      sender_type: 'admin', 
      content: message, 
      created_at: new Date().toISOString() 
    };
    setMessages(prev => [...prev, tempMsg]);
    setMessage('');

    try {
      await axios.post(`${API_URL}/reply`, { userId: selectedConversation.id, message: message }, getAuthHeaders());
    } catch (error) {
      console.error('Error sending reply:', error);
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setError('Failed to send message. Please try again.');
    }
  };

  const activeConversations = conversations.filter(c => c.status === 'active');

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-4">Live Chat Support</h2>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0" /> {error}
        </div>
      )}
      
      <div className="flex flex-1 bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
        {/* 1. Conversations List */}
        <div className="w-72 border-r border-gray-800 flex flex-col bg-dark-bg flex-shrink-0">
          <div className="p-3 border-b border-gray-800 flex justify-between items-center">
            <span className="font-semibold text-white flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-brand-secondary" /> Conversations
            </span>
            <button 
              onClick={() => { setIsRefreshing(true); fetchConversations(); setTimeout(() => setIsRefreshing(false), 800); }} 
              className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              title="Refresh"
            >
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
                {messages.map((msg) => {
                  // ✅ Database or Socket ထဲက Image Property မျိုးစုံကို စစ်ထုတ်ခြင်း
                  const rawImg = msg.image_url || msg.imageUrl || msg.image || msg.file_url;
                  const imgUrl = getFullImageUrl(rawImg);

                  return (
                    <div key={msg.id || Math.random()} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-xl px-3 py-2 ${msg.sender_type === 'admin' ? 'bg-brand-primary text-white' : 'bg-gray-800 text-gray-200'}`}>
                        
                        {/* ✅ စာသားရှိပါက ပြမည် */}
                        {msg.content && <p className="text-sm leading-relaxed mb-1">{msg.content}</p>}
                        
                        {/* ✅ ပုံရှိပါက Image Tag ဖြင့် Render ပြုလုပ်မည် */}
                        {imgUrl && (
                          <div className="mt-2 mb-1">
                            <img 
                              src={imgUrl} 
                              alt="Attachment" 
                              className="max-w-full max-h-60 rounded-lg object-cover cursor-pointer border border-gray-700/50 hover:opacity-90 transition-opacity"
                              onClick={() => window.open(imgUrl, '_blank')}
                            />
                          </div>
                        )}

                        <p className="text-[10px] mt-1 text-right opacity-70">
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
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
                  <button 
                    type="submit" 
                    disabled={!message.trim()} 
                    className="bg-brand-secondary text-white p-2 rounded-full hover:bg-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
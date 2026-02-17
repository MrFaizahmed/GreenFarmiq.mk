import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { chatService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ChatPage = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        const search = new URLSearchParams(location.search);
        const receiverId = search.get('receiverId');
        const listingTitle = search.get('listingTitle');
        const orderId = search.get('orderId');
        const chatId = params?.id;

        if (receiverId) {
          const defaultMsg = `Hi, I'm interested in your requirement${listingTitle ? `: "${listingTitle}"` : ''}. Can we discuss details?`;
          const res = await chatService.sendMessage({ receiverId, content: defaultMsg, orderId });
          if (res && res._id) {
            setChat(res);
            setMessages(res.messages || []);
            navigate(`/chat/${res._id}`, { replace: true });
          } else {
            setError(res?.message || res?.msg || 'Failed to start chat');
          }
        } else if (chatId) {
          const res = await chatService.getChatById(chatId);
          if (res && res._id) {
            setChat(res);
            setMessages(res.messages || []);
          } else {
            setError(res?.message || res?.msg || 'Failed to load chat');
          }
        } else {
          const list = await chatService.getChats();
          if (Array.isArray(list) && list.length > 0) {
            navigate(`/chat/${list[0]._id}`, { replace: true });
          } else {
            setError('No chats yet');
          }
        }
    } catch {
        setError('Failed to initialize chat');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [location.search, params?.id, isAuthenticated, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || !chat) return;
    try {
      const receiver = (chat.participants || []).find(p => (p._id || p.id) !== (user?._id || user?.id));
      const receiverId = receiver && (receiver._id || receiver.id);
      const res = await chatService.sendMessage({ receiverId, content: input, orderId: chat.orderId?._id || null });
      if (res && res._id) {
        setChat(res);
        setMessages(res.messages || []);
        setInput('');
      }
    } catch {
      setError('Failed to send message');
    }
  };

  if (loading) {
    return <div className="main-container"><div className="card">Loading chat...</div></div>;
  }

  if (error) {
    return <div className="main-container"><div className="card text-red-600">{error}</div></div>;
  }

  if (!chat) {
    return <div className="main-container"><div className="card">No chat selected</div></div>;
  }

  const other = (chat.participants || []).find(p => (p._id || p.id) !== (user?._id || user?.id));

  return (
    <div className="main-container">
      <div className="mb-4">
        <h1 className="page-title">Chat with {other?.name || 'User'}</h1>
      </div>
      <div className="card" style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-1 overflow-y-auto pr-2">
          {messages.map((m, idx) => {
            const mine = (m.senderId?._id || m.senderId) === (user?._id || user?.id);
            return (
              <div key={idx} className={`mb-2 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg max-w-[70%] ${mine ? 'bg-farm-green text-white' : 'bg-gray-100'}`}>
                  <div className="text-sm">{m.content}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Type your message..."
          />
          <button type="submit" className="btn-action btn-post">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;

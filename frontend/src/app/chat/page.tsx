'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  username: string;
  message: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      router.push('/'); // Redirect to login if no username
    } else {
      setUsername(storedUsername);
    }
  }, [router]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:8000/messages');
      if (response.ok) {
        const data: Message[] = await response.json();
        setMessages(data);
      } else {
        console.error('メッセージの取得に失敗しました。');
      }
    } catch (error) {
      console.error('API呼び出しエラー:', error);
    }
  };

  useEffect(() => {
    fetchMessages(); // Fetch historical messages

    socketRef.current = io('http://localhost:8000');

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
    });

    socketRef.current.on('message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !username) return;

    if (socketRef.current) {
      socketRef.current.emit('sendMessage', { username, message: newMessage });
      setNewMessage('');
    } else {
      console.error('WebSocket is not connected.');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-green-500 p-4 text-white text-center text-xl font-bold">
        チャットルーム - {username}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.username === username ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${msg.username === username ? 'bg-green-300 text-right' : 'bg-white text-left'}`}
            >
              <div className="font-bold text-sm">{msg.username}</div>
              <p className="text-gray-800">{msg.message}</p>
              <div className="text-xs text-gray-600 mt-1">{formatTimestamp(msg.timestamp)}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 flex items-center">
        <input
          type="text"
          className="flex-1 border rounded-full py-2 px-4 mr-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="メッセージを入力..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <button
          onClick={handleSendMessage}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M3.478 2.405a.75.75 0 0 0-.921.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.99L2.557 20.65a.75.75 0 0 0 .921.946l18.144-9.072a.75.75 0 0 0 0-1.342L3.478 2.405Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from './Message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatTabs } from './ChatTabs';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
  isEdited?: boolean;
  reactions?: { emoji: string; userId: string }[];
}

interface Chat {
  _id: string;
  title: string;
  lastMessage: string;
  isPinned: boolean;
  isArchived: boolean;
  updatedAt: string;
}

export function ChatInterface() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('/api/chat/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch chats');
        }

        const data = await response.json();
        setChats(data.chats);
        if (data.chats.length > 0) {
          setCurrentChatId(data.chats[0]._id);
        } else {
          // Create a new chat if none exists
          handleNewChat();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch chats';
        toast.error(message);
        setError(message);
      }
    };

    fetchChats();
  }, [token]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChatId || !token) return;
      
      setIsFirstLoad(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/chat/${currentChatId}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch messages');
        }

        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch messages';
        toast.error(message);
        setError(message);
      } finally {
        setIsFirstLoad(false);
      }
    };

    fetchMessages();
  }, [currentChatId, token]);

  const handleNewChat = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create new chat');
      }

      const data = await response.json();
      setChats(prev => [data.chat, ...prev]);
      setCurrentChatId(data.chat._id);
      setMessages([]);
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create new chat';
      toast.error(message);
      setError(message);
    }
  };

  const handleChatUpdate = async (chatId: string, updates: Partial<Chat>) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update chat');
      }

      const data = await response.json();
      setChats(prev => prev.map(chat => 
        chat._id === chatId ? { ...chat, ...updates } : chat
      ));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update chat';
      toast.error(message);
    }
  };

  const handleChatDelete = async (chatId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete chat');
      }

      setChats(prev => prev.filter(chat => chat._id !== chatId));
      if (currentChatId === chatId) {
        const remainingChats = chats.filter(chat => chat._id !== chatId);
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0]._id);
        } else {
          setCurrentChatId('');
          setMessages([]);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete chat';
      toast.error(message);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentChatId || !token) return;

    setIsLoading(true);
    setError(null);
    const userMessage = input.trim();
    setInput('');

    // Optimistically add user message
    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      content: userMessage,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await fetch(`/api/chat/${currentChatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      
      // Remove the temporary message and add both messages from the server
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== tempMessage.id),
        ...data.messages
      ]);

      // Update chat list with last message
      setChats(prev => prev.map(chat => 
        chat._id === currentChatId 
          ? { ...chat, lastMessage: userMessage }
          : chat
      ));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(message);
      setError(message);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-red-500 mb-4">
          <span className="font-medium">Error:</span> {error}
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[300px,1fr] h-[calc(100vh-8rem)] gap-4">
      <div className="border rounded-lg bg-white dark:bg-gray-800">
        <ChatTabs
          chats={chats}
          currentChatId={currentChatId}
          onChatSelect={setCurrentChatId}
          onNewChat={handleNewChat}
          onChatUpdate={handleChatUpdate}
          onChatDelete={handleChatDelete}
        />
      </div>
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg border">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {isFirstLoad ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-12 w-12 mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-lg font-medium">Start a New Conversation</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Your messages will appear here</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Message {...message} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t bg-gray-50/50 dark:bg-gray-800/50 p-4">
          <form onSubmit={sendMessage} className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading || !currentChatId}
              className="pr-24 py-6 text-base bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              type="submit"
              disabled={isLoading || !currentChatId}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 
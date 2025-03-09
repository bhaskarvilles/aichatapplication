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
  status?: 'sending' | 'sent' | 'delivered' | 'error';
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
  const [isTyping, setIsTyping] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

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

  const handleTyping = () => {
    if (!currentChatId || !token) return;

    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing event to server
    fetch(`/api/chat/${currentChatId}/typing`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!currentChatId || !token) return;

    try {
      const response = await fetch(`/api/chat/${currentChatId}/message/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit message');
      }

      const data = await response.json();
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: newContent, isEdited: true } : msg
      ));
      setEditingMessageId(null);
      setEditContent('');
    } catch (error) {
      toast.error('Failed to edit message');
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!currentChatId || !token) return;

    try {
      const response = await fetch(`/api/chat/${currentChatId}/message/${messageId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }

      const data = await response.json();
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, reactions: data.reactions } : msg
      ));
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  const exportChat = async () => {
    if (!currentChatId || !token) return;

    try {
      const response = await fetch(`/api/chat/${currentChatId}/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export chat');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${currentChatId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to export chat');
    }
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <ChatTabs
          chats={chats}
          currentChatId={currentChatId}
          onChatSelect={setCurrentChatId}
          onNewChat={handleNewChat}
          onChatUpdate={handleChatUpdate}
          onChatDelete={handleChatDelete}
        />
        <div className="flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Button
            variant="outline"
            onClick={exportChat}
            disabled={!currentChatId}
          >
            Export Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isFirstLoad ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet</div>
        ) : (
          filteredMessages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onEdit={handleEditMessage}
              onReaction={handleReaction}
              isEditing={editingMessageId === message.id}
              editContent={editContent}
              setEditContent={setEditContent}
              onStartEdit={() => {
                setEditingMessageId(message.id);
                setEditContent(message.content);
              }}
              onCancelEdit={() => {
                setEditingMessageId(null);
                setEditContent('');
              }}
            />
          ))
        )}
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 
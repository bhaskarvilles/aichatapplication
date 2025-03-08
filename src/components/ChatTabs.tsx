'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  MessageSquarePlus,
  Pin,
  Archive,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Chat {
  _id: string;
  title: string;
  lastMessage: string;
  isPinned: boolean;
  isArchived: boolean;
  updatedAt: string;
}

interface ChatTabsProps {
  chats: Chat[];
  currentChatId: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onChatUpdate: (chatId: string, updates: Partial<Chat>) => void;
  onChatDelete: (chatId: string) => void;
}

export function ChatTabs({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onChatUpdate,
  onChatDelete,
}: ChatTabsProps) {
  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const activeChats = sortedChats.filter(chat => !chat.isArchived);
  const archivedChats = sortedChats.filter(chat => chat.isArchived);

  const handlePin = (chatId: string, isPinned: boolean) => {
    onChatUpdate(chatId, { isPinned });
    toast.success(isPinned ? 'Chat pinned' : 'Chat unpinned');
  };

  const handleArchive = (chatId: string, isArchived: boolean) => {
    onChatUpdate(chatId, { isArchived });
    toast.success(isArchived ? 'Chat archived' : 'Chat unarchived');
  };

  const handleDelete = (chatId: string) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      onChatDelete(chatId);
      toast.success('Chat deleted');
    }
  };

  const renderChatList = (chats: Chat[], isArchived: boolean = false) => (
    <div className="space-y-2">
      {chats.map((chat) => (
        <div
          key={chat._id}
          className={cn(
            'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
            currentChatId === chat._id && 'bg-accent',
            isArchived && 'opacity-70'
          )}
        >
          <Button
            variant="ghost"
            className="flex-1 justify-start gap-2 font-normal"
            onClick={() => onChatSelect(chat._id)}
          >
            <span className="truncate">{chat.title}</span>
          </Button>
          {chat.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePin(chat._id, !chat.isPinned)}>
                <Pin className="mr-2 h-4 w-4" />
                {chat.isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleArchive(chat._id, !chat.isArchived)}>
                <Archive className="mr-2 h-4 w-4" />
                {chat.isArchived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => handleDelete(chat._id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="px-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onNewChat}
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        {activeChats.length > 0 && (
          <div className="mb-4">
            <h2 className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
              Active Chats
            </h2>
            {renderChatList(activeChats)}
          </div>
        )}
        {archivedChats.length > 0 && (
          <div>
            <h2 className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
              Archived
            </h2>
            {renderChatList(archivedChats, true)}
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 
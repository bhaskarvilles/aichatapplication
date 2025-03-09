'use client';

import React from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X, Smile } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface MessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    createdAt: string;
    status?: 'sending' | 'sent' | 'delivered' | 'error';
    isEdited?: boolean;
    reactions?: { emoji: string; userId: string }[];
  };
  onEdit: (messageId: string, newContent: string) => Promise<void>;
  onReaction: (messageId: string, emoji: string) => Promise<void>;
  isEditing: boolean;
  editContent: string;
  setEditContent: (content: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

const EMOJI_LIST = ['👍', '❤️', '😊', '🎉', '🤔', '👏', '🙌', '💡'];

export function Message({
  message,
  onEdit,
  onReaction,
  isEditing,
  editContent,
  setEditContent,
  onStartEdit,
  onCancelEdit,
}: MessageProps) {
  const { user } = useAuth();
  const isUserMessage = message.role === 'user';

  const handleSaveEdit = async () => {
    if (editContent.trim() === message.content) {
      onCancelEdit();
      return;
    }
    await onEdit(message.id, editContent.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied to clipboard');
  };

  return (
    <div
      className={`flex ${
        isUserMessage ? 'justify-end' : 'justify-start'
      } items-start space-x-2 group`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-4 ${
          isUserMessage
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || editContent.trim() === message.content}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs opacity-70">
              <span>
                {format(new Date(message.createdAt), 'HH:mm')}
                {message.isEdited && ' (edited)'}
              </span>
              {message.status && (
                <span className="ml-2">
                  {message.status === 'sending' && '⋯'}
                  {message.status === 'sent' && '✓'}
                  {message.status === 'delivered' && '✓✓'}
                  {message.status === 'error' && '⚠️'}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUserMessage && !isEditing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onStartEdit}
            className="p-1"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="p-1"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-2">
            <div className="grid grid-cols-4 gap-2">
              {EMOJI_LIST.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => onReaction(message.id, emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {message.reactions && message.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.entries(
            message.reactions.reduce((acc, { emoji, userId }) => {
              acc[emoji] = (acc[emoji] || []).concat(userId);
              return acc;
            }, {} as Record<string, string[]>)
          ).map(([emoji, userIds]) => (
            <Button
              key={emoji}
              size="sm"
              variant="ghost"
              className="px-2 py-0 h-6 text-sm bg-gray-100 dark:bg-gray-800"
              onClick={() => onReaction(message.id, emoji)}
            >
              {emoji} {userIds.length}
            </Button>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 
'use client';

import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

export function Message({ content, role, createdAt }: MessageProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  return (
    <Card
      className={cn(
        'transition-colors',
        role === 'user' 
          ? 'bg-blue-50 border-blue-100' 
          : 'bg-gray-50 border-gray-100'
      )}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className={cn(
            'h-8 w-8',
            role === 'user' ? 'bg-blue-500' : 'bg-gray-600'
          )}>
            {role === 'user' ? (
              <User className="h-5 w-5 text-white" />
            ) : (
              <Bot className="h-5 w-5 text-white" />
            )}
            <AvatarFallback>
              {role === 'user' ? 'U' : 'AI'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0 gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-medium',
                  role === 'user' ? 'text-blue-700' : 'text-gray-700'
                )}>
                  {role === 'user' ? 'You' : 'AI Assistant'}
                </span>
                <span className="text-xs text-gray-400">
                  {format(new Date(createdAt), 'h:mm a')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {role === 'assistant' && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                      onClick={() => toast.info('Feedback recorded')}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                      onClick={() => toast.info('Feedback recorded')}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </>
                )}
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
            <div className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap break-words">
              {content}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
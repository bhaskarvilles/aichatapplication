'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatInterface } from '@/components/ChatInterface';
import { LoginForm } from '@/components/LoginForm';
import { UserProfile } from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { Settings, MessageSquare, Crown } from 'lucide-react';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="mb-8 w-full max-w-md text-center">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            AI Chat App
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chat with an AI assistant powered by Cloudflare Workers AI
          </p>
        </div>
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
        <div className="mt-8">
          <ThemeToggle />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">AI Chat App</h1>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Beta
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                Welcome, {user.name}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowProfile(false);
                        setShowSubscription(true);
                      }}
                      className={`transition-transform hover:scale-105 ${showSubscription && 'text-blue-600 dark:text-blue-400'}`}
                    >
                      <Crown className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Premium Features (Beta)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowProfile(true);
                  setShowSubscription(false);
                }}
                className={`transition-transform hover:scale-105 ${showProfile && !showSubscription && 'text-blue-600 dark:text-blue-400'}`}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowProfile(false);
                  setShowSubscription(false);
                }}
                className={`transition-transform hover:scale-105 ${!showProfile && !showSubscription && 'text-blue-600 dark:text-blue-400'}`}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={() => logout()}
                className="transition-colors hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {showSubscription ? (
            <div className="w-full animate-in slide-in-from-right">
              <SubscriptionPlans />
            </div>
          ) : showProfile ? (
            <div className="w-full animate-in slide-in-from-right">
              <UserProfile />
            </div>
          ) : (
            <div className="w-full animate-in slide-in-from-left">
              <ChatInterface />
            </div>
          )}
        </div>
      </main>
      <Toaster position="top-center" />
    </div>
  );
} 
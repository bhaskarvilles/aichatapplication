'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatInterface } from '@/components/ChatInterface';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
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
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="mb-8 w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-2">AI Chat App</h1>
          <p className="text-gray-600 text-center">
            Chat with an AI assistant powered by Cloudflare Workers AI
          </p>
        </div>
        <div className="w-full max-w-md">
          {showLogin ? (
            <div className="space-y-4">
              <LoginForm />
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-blue-600 hover:underline transition-colors"
                >
                  Register
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <RegisterForm />
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-blue-600 hover:underline transition-colors"
                >
                  Login
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">AI Chat App</h1>
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Beta
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:inline">
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
                      className={`transition-transform hover:scale-105 ${showSubscription && 'text-blue-600'}`}
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
                className={`transition-transform hover:scale-105 ${showProfile && !showSubscription && 'text-blue-600'}`}
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
                className={`transition-transform hover:scale-105 ${!showProfile && !showSubscription && 'text-blue-600'}`}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                onClick={logout}
                className="transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-300"
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
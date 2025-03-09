'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = '/';
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="mb-8 w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
          Welcome Back
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to continue to AI Chat App
        </p>
      </div>
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
} 
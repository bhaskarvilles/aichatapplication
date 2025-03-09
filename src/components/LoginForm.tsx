import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const { login, isLoading } = useAuth();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => login()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Continue with Auth0
          </Button>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Secure login powered by Auth0
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 
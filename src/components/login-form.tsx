'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const initialState: { message: string, errors?: any } = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
      Sign In
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-3xl font-bold font-headline">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              required
              className="pl-10"
              aria-describedby="email-error"
            />
          </div>
          {state.errors?.email && (
            <p id="email-error" className="text-sm text-destructive mt-1">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="pl-10"
              aria-describedby="password-error"
            />
          </div>
           {state.errors?.password && (
            <p id="password-error" className="text-sm text-destructive mt-1">{state.errors.password[0]}</p>
          )}
        </div>
        {state.message && !state.errors && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Failed</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <SubmitButton />
        <p className="text-xs text-center text-muted-foreground">
          Use email <strong className="font-mono text-foreground">user@example.com</strong> and password <strong className="font-mono text-foreground">password123</strong>
        </p>
      </CardFooter>
    </form>
  );
}

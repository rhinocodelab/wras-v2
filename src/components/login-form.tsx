'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const initialState: { message: string, errors?: any } = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2" />}
      Sign In
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col h-full">
      <CardHeader className="px-0 pt-0 text-center">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>To access your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 mt-6 px-0">
        <div className="space-y-2">
          <Label htmlFor="email" className='sr-only'>Username</Label>
          <div className="relative flex items-center">
            <User className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="text"
              placeholder="Username"
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
          <Label htmlFor="password" className='sr-only'>Password</Label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
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
      <CardFooter className="flex flex-col items-center gap-4 px-0 pb-0 mt-4">
        <SubmitButton />
      </CardFooter>
    </form>
  );
}

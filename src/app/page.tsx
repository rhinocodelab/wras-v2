import { getSession, logout } from '@/app/actions';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-2 border-border">
        <CardHeader className="text-center p-8">
          <CardTitle className="text-3xl font-bold font-headline">Welcome!</CardTitle>
          <CardDescription className="pt-2">You have successfully signed in.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg">
            Hello, <span className="font-semibold text-primary">{session.name}</span>!
          </p>
          <p className="text-center text-muted-foreground mt-1">
            ({session.email})
          </p>
        </CardContent>
        <CardFooter className="p-8 pt-0">
          <form action={logout} className="w-full">
            <Button type="submit" variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

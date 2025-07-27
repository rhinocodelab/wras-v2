import { logout } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { LogOut, TramFront, User } from 'lucide-react';
import Link from 'next/link';
import { SidebarTrigger } from './ui/sidebar';

type HeaderProps = {
  session: {
    name: string;
    email: string;
  } | null;
};

export function Header({ session }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
      <SidebarTrigger className="sm:hidden" />
      <div className="flex items-center gap-4 ml-auto">
        {session && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span>Welcome, {session.name}</span>
          </div>
        )}
        <form action={logout}>
          <Button variant="outline" size="icon" type="submit" className='w-10 h-10'>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign Out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}

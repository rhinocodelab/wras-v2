import { logout } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { LogOut, TramFront, User } from 'lucide-react';
import Link from 'next/link';

type HeaderProps = {
  session: {
    name: string;
    email: string;
  } | null;
};

export function Header({ session }: HeaderProps) {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="flex w-full flex-row items-center justify-between gap-6 text-lg font-medium md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <div className="flex h-10 w-10 items-center justify-center bg-primary">
            <TramFront className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold">WRAS-DHH</div>
            <div className="text-xs text-muted-foreground">
              Western Railway Announcement System
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {session && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>Welcome, {session.name}</span>
            </div>
          )}
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </nav>
    </header>
  );
}

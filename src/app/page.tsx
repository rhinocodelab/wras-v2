
import { getSession } from '@/app/actions';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Home,
  GitFork,
  Megaphone,
  Volume2,
  Database,
  Video,
  Search,
  PanelLeft,
  TramFront,
} from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { logout } from '@/app/actions';

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted/40">
      <div className="flex min-h-screen w-full max-w-7xl flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <TramFront className="h-6 w-6" />
            <span className="text-lg font-bold text-primary">WRAS-DHH</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                  prefetch={false}
                >
                  <Home className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Railway Dashboard</span>
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/train-route-management"
                  className="flex items-center gap-4 px-2.5 text-foreground"
                  prefetch={false}
                >
                  <GitFork className="h-5 w-5" />
                  Route Management
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <Megaphone className="h-5 w-5" />
                  Announcement Templates
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <Volume2 className="h-5 w-5" />
                  Audio Templates
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <Database className="h-5 w-5" />
                  AI Database
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  <Video className="h-5 w-5" />
                  ISL Dataset
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-4 ml-auto">
            {session && (
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>Welcome, {session.name}</span>
              </div>
            )}
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </header>
        <div className="flex flex-1">
          <aside className="hidden w-60 flex-col border-r bg-background sm:flex">
            <nav className="flex-1 overflow-auto py-4">
              <div className="grid items-start px-4 text-sm font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
                  prefetch={false}
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/train-route-management"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  prefetch={false}
                >
                  <GitFork className="h-4 w-4" />
                  Route Management
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  prefetch={false}
                >
                  <Megaphone className="h-4 w-4" />
                  Announcement Templates
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  prefetch={false}
                >
                  <Volume2 className="h-4 w-4" />
                  Audio Templates
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  prefetch={false}
                >
                  <Database className="h-4 w-4" />
                  AI Database
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  prefetch={false}
                >
                  <Video className="h-4 w-4" />
                  ISL Dataset
                </Link>
              </div>
            </nav>
          </aside>
          <main className="flex-1 p-4 sm:p-6">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold md:text-2xl">
                Train Search
              </h1>
            </div>
            <p className="text-muted-foreground">
              Search for trains by number or name
            </p>
            <div className="w-full max-w-xl mt-4">
              <Tabs defaultValue="train-number">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="train-number">Train Number</TabsTrigger>
                  <TabsTrigger value="train-name">Train Name</TabsTrigger>
                </TabsList>
                <TabsContent value="train-number">
                  <div className="flex items-center space-x-2 pt-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by train number..."
                        className="pl-10"
                      />
                    </div>
                    <Button>Search</Button>
                    <Button variant="secondary">Pick Route</Button>
                    <Button variant="ghost">Clear</Button>
                  </div>
                </TabsContent>
                <TabsContent value="train-name">
                  <div className="flex items-center space-x-2 pt-.5">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by train name..."
                        className="pl-10"
                      />
                    </div>
                    <Button>Search</Button>
                    <Button variant="secondary">Pick Route</Button>
                    <Button variant="ghost">Clear</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

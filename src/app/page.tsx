
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Home,
  GitFork,
  Database,
  Video,
  PanelLeft,
  TramFront,
} from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { logout } from '@/app/actions';
import { Dashboard } from '@/components/dashboard';
import TrainRouteManagementPage from '@/app/train-route-management/page';
import AiDatabasePage from '@/app/ai-database/page';
import TranslationsPage from '@/app/ai-database/translations/page';
import AudioPage from '@/app/ai-database/audio/page';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HomePage() {
  const [activeView, setActiveView] = useState('dashboard');
  const session = { name: 'Admin' }; // This should be replaced by a proper session management call

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'route-management':
        return <TrainRouteManagementPage />;
      case 'ai-database':
        return <AiDatabasePage onViewChange={setActiveView} />;
      case 'translations':
        return <TranslationsPage onViewChange={setActiveView} />;
      case 'audio':
        return <AudioPage onViewChange={setActiveView} />;
      default:
        return <Dashboard />;
    }
  };

  const getLinkClassName = (view: string) => {
    const baseClass = `flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary`;
    const isActive = activeView === view || (view === 'ai-database' && (activeView === 'translations' || activeView === 'audio'));
    return `${baseClass} ${
      isActive
        ? 'bg-muted text-primary'
        : 'text-muted-foreground'
    }`;
  };

  const getMobileLinkClassName = (view: string) => {
    const baseClass = `flex cursor-pointer items-center gap-4 px-2.5 transition-all hover:text-foreground`;
    const isActive = activeView === view || (view === 'ai-database' && (activeView === 'translations' || activeView === 'audio'));
    return `${baseClass} ${
      isActive
        ? 'text-foreground'
        : 'text-muted-foreground'
    }`;
  };

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
                <div
                  onClick={() => setActiveView('dashboard')}
                  className={getMobileLinkClassName('dashboard')}
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </div>
                <div
                  onClick={() => setActiveView('route-management')}
                  className={getMobileLinkClassName('route-management')}
                >
                  <GitFork className="h-5 w-5" />
                  Route Management
                </div>
                <div
                  onClick={() => setActiveView('ai-database')}
                  className={getMobileLinkClassName('ai-database')}
                >
                  <Database className="h-5 w-5" />
                  AI Generated Assets
                </div>
                <div
                  onClick={() => {}}
                  className="flex cursor-pointer items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Video className="h-5 w-5" />
                  ISL Video Generation
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="ml-auto flex items-center gap-4">
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
            <nav className="flex flex-1 flex-col overflow-auto py-4">
              <div className="grid items-start px-4 text-sm font-medium">
                <div
                  onClick={() => setActiveView('dashboard')}
                  className={getLinkClassName('dashboard')}
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </div>
                <div
                  onClick={() => setActiveView('route-management')}
                  className={getLinkClassName('route-management')}
                >
                  <GitFork className="h-4 w-4" />
                  Route Management
                </div>
                <div
                  onClick={() => setActiveView('ai-database')}
                  className={getLinkClassName('ai-database')}
                >
                  <Database className="h-4 w-4" />
                  AI Generated Assets
                </div>
                <div
                  onClick={() => {}}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Video className="h-4 w-4" />
                  ISL Video Generation
                </div>
              </div>
            </nav>
          </aside>
          <main className="flex-1 p-4 sm:p-6">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}

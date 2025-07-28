
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Home,
  GitFork,
  Database,
  PanelLeft,
  TramFront,
  FolderKanban,
  ClipboardList,
  Speech,
} from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { logout } from '@/app/actions';
import { Dashboard } from '@/components/dashboard';
import TrainRouteManagementPage from '@/app/train-route-management/page';
import AiDatabasePage from '@/app/ai-database/page';
import TranslationsPage from '@/app/ai-database/translations/page';
import AudioPage from '@/app/ai-database/audio/page';
import TemplateAudioPage from '@/app/ai-database/template-audio/page';
import IslDatasetPage from '@/app/isl-dataset/page';
import AnnouncementTemplatesPage from '@/app/announcement-templates/page';

// Placeholder for the new component
const SpeechToIslPage = () => (
  <div className="flex items-center justify-center h-full">
    <h1 className="text-2xl font-semibold text-muted-foreground">
      Speech to ISL Page - Coming Soon
    </h1>
  </div>
);

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
      case 'template-audio':
        return <TemplateAudioPage onViewChange={setActiveView} />;
      case 'isl-dataset':
        return <IslDatasetPage />;
      case 'announcement-templates':
        return <AnnouncementTemplatesPage />;
      case 'speech-to-isl':
        return <SpeechToIslPage />;
      default:
        return <Dashboard />;
    }
  };

  const getLinkClassName = (view: string) => {
    const baseClass = `flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary`;
    const isActive = activeView === view || (view === 'ai-database' && (activeView === 'translations' || activeView === 'audio' || activeView === 'template-audio'));
    return `${baseClass} ${
      isActive
        ? 'bg-muted text-primary'
        : 'text-muted-foreground'
    }`;
  };

  const getMobileLinkClassName = (view: string) => {
    const baseClass = `flex cursor-pointer items-center gap-4 px-2.5 transition-all hover:text-foreground`;
    const isActive = activeView === view || (view === 'ai-database' && (activeView === 'translations' || activeView === 'audio' || activeView === 'template-audio'));
    return `${baseClass} ${
      isActive
        ? 'text-foreground'
        : 'text-muted-foreground'
    }`;
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted/40">
      <div className="flex w-full max-w-7xl flex-col">
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
                  onClick={() => setActiveView('isl-dataset')}
                  className={getMobileLinkClassName('isl-dataset')}
                >
                  <FolderKanban className="h-5 w-5" />
                  ISL Dataset
                </div>
                <div
                  onClick={() => setActiveView('announcement-templates')}
                  className={getMobileLinkClassName('announcement-templates')}
                >
                  <ClipboardList className="h-5 w-5" />
                  Announcement Templates
                </div>
                 <div
                  onClick={() => setActiveView('speech-to-isl')}
                  className={getMobileLinkClassName('speech-to-isl')}
                >
                  <Speech className="h-5 w-5" />
                  Speech to ISL
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
                  onClick={() => setActiveView('isl-dataset')}
                  className={getLinkClassName('isl-dataset')}
                >
                  <FolderKanban className="h-4 w-4" />
                  ISL Dataset
                </div>
                <div
                  onClick={() => setActiveView('announcement-templates')}
                  className={getLinkClassName('announcement-templates')}
                >
                  <ClipboardList className="h-4 w-4" />
                  Announcement Templates
                </div>
                <div
                  onClick={() => setActiveView('speech-to-isl')}
                  className={getLinkClassName('speech-to-isl')}
                >
                  <Speech className="h-4 w-4" />
                  Speech to ISL
                </div>
              </div>
            </nav>
          </aside>
          <main className="flex-1 p-4 sm:p-6 pb-16">{renderContent()}</main>
        </div>
      </div>
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="py-3 text-center text-sm text-muted-foreground">
                  Designed and Developed by Sundyne Technologies copyright 2025
              </div>
          </div>
      </footer>
    </div>
  );
}


import { getSession } from '@/app/actions';
import { redirect } from 'next/navigation';
import { Header } from '@/components/header';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
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
} from 'lucide-react';

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header session={session} />
      <div className="flex flex-1">
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton href="#" isActive>
                    <Home />
                    Dashboard
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="#">
                    <GitFork />
                    Route Management
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="#">
                    <Megaphone />
                    Announcement Templates
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="#">
                    <Volume2 />
                    Audio Templates
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="#">
                    <Database />
                    AI Database
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="#">
                    <Video />
                    ISL Dataset
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold md:text-2xl">
                Train Search
              </h1>
            </div>
            <p className="text-muted-foreground">
              Search for trains by number or name
            </p>
            <div className="w-full max-w-xl">
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
                  <div className="flex items-center space-x-2 pt-4">
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
        </SidebarProvider>
      </div>
    </div>
  );
}

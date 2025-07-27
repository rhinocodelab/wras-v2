
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, GitFork, Languages, Video, Accessibility } from 'lucide-react';

export function Dashboard() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">
          Dashboard
        </h1>
      </div>
      
      <Card className="mt-4 w-full overflow-hidden">
        <div className="bg-primary/10 p-6 sm:p-8 md:p-10">
          <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Accessibility className="h-8 w-8 text-primary" />
              </div>
              <div className='max-w-xl'>
                <h2 className="text-2xl font-bold text-foreground">Welcome to the WRAS-DHH Dashboard!</h2>
                <p className="text-muted-foreground mt-2">
                  The Western Railway Announcement System for the Deaf and Hard of Hearing. This tool empowers you to manage train routes, generate multilingual translations, and ultimately produce Indian Sign Language (ISL) video announcements.
                </p>
              </div>
          </div>
        </div>
        <div className="p-6 bg-background">
            <h3 className="text-lg font-semibold text-center mb-4">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-secondary rounded-full">
                        <GitFork className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <h4 className="font-semibold">Route Management</h4>
                    <p className="text-xs text-muted-foreground">Easily add, import, and manage all train routes.</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-secondary rounded-full">
                        <Languages className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <h4 className="font-semibold">AI Translations & Audio</h4>
                    <p className="text-xs text-muted-foreground">Generate text translations and audio in multiple languages.</p>
                </div>
                 <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-secondary rounded-full">
                        <Video className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <h4 className="font-semibold">ISL Video Generation</h4>
                    <p className="text-xs text-muted-foreground">Create accessible ISL video announcements from route data.</p>
                </div>
            </div>
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Train Search</h2>
        <p className="text-muted-foreground mb-4">
          Search for trains by number or name to quickly find a route.
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
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
      </div>
    </>
  );
}

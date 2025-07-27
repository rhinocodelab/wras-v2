
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, GitFork, Languages, Video, Accessibility } from 'lucide-react';

export function Dashboard() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">
          Dashboard
        </h1>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-6 w-6 text-primary" />
            Welcome to the WRAS-DHH Dashboard!
          </CardTitle>
          <CardDescription>
            This is the Western Railway Announcement System for the Deaf and Hard of Hearing. 
            This application is designed to generate announcements in Indian Sign Language (ISL) video format.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <h3 className="text-md font-semibold mb-2">Key Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    <GitFork className="h-5 w-5 text-muted-foreground" />
                    <span>Manage train routes and schedules.</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    <Languages className="h-5 w-5 text-muted-foreground" />
                    <span>Generate multilingual text and audio translations.</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    <Video className="h-5 w-5 text-muted-foreground" />
                    <span>Create ISL video announcements.</span>
                </div>
            </div>
        </CardContent>
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

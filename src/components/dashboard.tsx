
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Accessibility } from 'lucide-react';

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
            <p className='text-sm text-muted-foreground'>Use the features in the sidebar to manage routes, generate AI assets, and create video announcements.</p>
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

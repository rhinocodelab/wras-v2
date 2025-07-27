
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

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
            <CardTitle>About This Application</CardTitle>
            <CardDescription>
                This application is the Western Railway Announcement System for the Deaf and Hard of Hearing (WRAS-DHH). It is designed to generate announcements in Indian Sign Language (ISL) video format to improve accessibility.
            </CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Train Search</h2>
        <p className="text-muted-foreground">
          Search for trains by number or name
        </p>
        <div className="mt-4 w-full max-w-xl">
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


'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Accessibility } from 'lucide-react';
import { getTrainRoutes, TrainRoute } from '@/app/actions';

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allRoutes, setAllRoutes] = useState<TrainRoute[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<TrainRoute[]>([]);
  const [displayedRoutes, setDisplayedRoutes] = useState<TrainRoute[]>([]);
  const [searchNumber, setSearchNumber] = useState('');
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    async function fetchRoutes() {
      const routes = await getTrainRoutes();
      setAllRoutes(routes);
    }
    fetchRoutes();
  }, []);

  const handleSelectRoute = (route: TrainRoute) => {
    setSelectedRoutes(prevSelected => {
      if (prevSelected.find(r => r.id === route.id)) {
        return prevSelected.filter(r => r.id !== route.id);
      } else {
        return [...prevSelected, route];
      }
    });
  };

  const handleAddSelectedRoutes = () => {
    setDisplayedRoutes(selectedRoutes);
    setIsModalOpen(false);
  };
  
  const handleSearchByNumber = () => {
    const results = allRoutes.filter(route =>
      route['Train Number'].includes(searchNumber)
    );
    setDisplayedRoutes(results);
  };

  const handleSearchByName = () => {
    const results = allRoutes.filter(route =>
      route['Train Name'].toLowerCase().includes(searchName.toLowerCase())
    );
    setDisplayedRoutes(results);
  };

  const clearSearch = () => {
    setSearchNumber('');
    setSearchName('');
    setDisplayedRoutes([]);
    setSelectedRoutes([]);
  }

  return (
    <>
      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-6 w-6 text-primary" />
            Welcome to the WRAS-DHH
          </CardTitle>
        </CardHeader>
        <CardContent>
             <div className="mt-2">
                <p className="text-muted-foreground mb-4 text-sm">
                Search for trains by number or name to quickly find a route.
                </p>
                <div className="w-full">
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
                            value={searchNumber}
                            onChange={(e) => setSearchNumber(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchByNumber()}
                            />
                        </div>
                        <Button onClick={handleSearchByNumber}>Search</Button>
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" onClick={() => setSelectedRoutes(displayedRoutes)}>Pick Route</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                <DialogTitle>Select Train Routes</DialogTitle>
                                <DialogDescription>
                                    Select one or more train routes to add to the dashboard.
                                </DialogDescription>
                                </DialogHeader>
                                <div className="max-h-[60vh] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Select</TableHead>
                                        <TableHead>Train Number</TableHead>
                                        <TableHead>Train Name</TableHead>
                                        <TableHead>Start Station</TableHead>
                                        <TableHead>End Station</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {allRoutes.map(route => (
                                        <TableRow key={route.id}>
                                        <TableCell>
                                            <Checkbox
                                            checked={!!selectedRoutes.find(r => r.id === route.id)}
                                            onCheckedChange={() => handleSelectRoute(route)}
                                            />
                                        </TableCell>
                                        <TableCell>{route['Train Number']}</TableCell>
                                        <TableCell>{route['Train Name']}</TableCell>
                                        <TableCell>{route['Start Station']}</TableCell>
                                        <TableCell>{route['End Station']}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                                </div>
                                <DialogFooter>
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddSelectedRoutes}>Add Selected</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button variant="ghost" onClick={clearSearch}>Clear</Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="train-name">
                        <div className="flex items-center space-x-2 pt-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                            placeholder="Search by train name..."
                            className="pl-10"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchByName()}
                            />
                        </div>
                        <Button onClick={handleSearchByName}>Search</Button>
                         <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="secondary" onClick={() => setSelectedRoutes(displayedRoutes)}>Pick Route</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                <DialogTitle>Select Train Routes</DialogTitle>
                                <DialogDescription>
                                    Select one or more train routes to add to the dashboard.
                                </DialogDescription>
                                </DialogHeader>
                                <div className="max-h-[60vh] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Select</TableHead>
                                        <TableHead>Train Number</TableHead>
                                        <TableHead>Train Name</TableHead>
                                        <TableHead>Start Station</TableHead>
                                        <TableHead>End Station</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {allRoutes.map(route => (
                                        <TableRow key={route.id}>
                                        <TableCell>
                                            <Checkbox
                                            checked={!!selectedRoutes.find(r => r.id === route.id)}
                                            onCheckedChange={() => handleSelectRoute(route)}
                                            />
                                        </TableCell>
                                        <TableCell>{route['Train Number']}</TableCell>
                                        <TableCell>{route['Train Name']}</TableCell>
                                        <TableCell>{route['Start Station']}</TableCell>
                                        <TableCell>{route['End Station']}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                                </div>
                                <DialogFooter>
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddSelectedRoutes}>Add Selected</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button variant="ghost" onClick={clearSearch}>Clear</Button>
                        </div>
                    </TabsContent>
                    </Tabs>
                </div>
            </div>
        </CardContent>
      </Card>

      {displayedRoutes.length > 0 && (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Selected Routes</CardTitle>
                <CardDescription>The following routes have been selected for processing.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Train Number</TableHead>
                            <TableHead>Train Name</TableHead>
                            <TableHead>Start Station</TableHead>
                            <TableHead>End Station</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedRoutes.map(route => (
                            <TableRow key={route.id}>
                                <TableCell>{route['Train Number']}</TableCell>
                                <TableCell>{route['Train Name']}</TableCell>
                                <TableCell>{route['Start Station']}</TableCell>
                                <TableCell>{route['End Station']}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}
    </>
  );
}

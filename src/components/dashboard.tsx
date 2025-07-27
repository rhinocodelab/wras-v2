
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Search, Volume2, Accessibility, Loader2, Video } from 'lucide-react';
import { getTrainRoutes, TrainRoute, handleGenerateAnnouncement } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type DisplayRoute = TrainRoute & {
  platform: string;
  category: string;
};

type Announcement = {
    language_code: string;
    text: string;
    audio_path: string | null;
}

type FullAnnouncement = {
    announcements: Announcement[];
    isl_video_playlist: string[];
}

const ANNOUNCEMENT_CATEGORIES = ['Arriving', 'Delay', 'Cancelled', 'Platform_Change'];
const LANGUAGE_MAP: { [key: string]: string } = {
  'en': 'English',
  'mr': 'Marathi',
  'hi': 'Hindi',
  'gu': 'Gujarati',
};


const IslVideoPlayer = ({ playlist }: { playlist: string[] }) => {
    const [currentVideo, setCurrentVideo] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Reset to first video when playlist changes
        setCurrentVideo(0);
    }, [playlist]);

    const handleVideoEnd = () => {
        if (currentVideo < playlist.length - 1) {
            setCurrentVideo(currentVideo + 1);
        }
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play();
        }
    }, [currentVideo]);

    if (!playlist || playlist.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-muted rounded-lg p-4">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">ISL Announcement</h3>
                <p className="text-sm text-muted-foreground text-center">No matching ISL videos found for this announcement.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <video
                ref={videoRef}
                key={playlist[currentVideo]}
                className="w-full rounded-t-lg"
                controls={false}
                autoPlay
                muted
                onEnded={handleVideoEnd}
            >
                <source src={playlist[currentVideo]} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="flex-grow p-4 bg-muted rounded-b-lg">
                <h3 className="font-semibold text-sm mb-2">ISL Video Sequence</h3>
                <p className="text-xs text-muted-foreground">Playing video {currentVideo + 1} of {playlist.length}</p>
                 <div className="mt-2 text-xs text-muted-foreground break-all">
                   Current: {playlist[currentVideo].split('/').pop()?.replace('.mp4', '').replace(/_/g, ' ')}
                </div>
            </div>
        </div>
    );
};


export function Dashboard() {
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allRoutes, setAllRoutes] = useState<TrainRoute[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<TrainRoute[]>([]);
  const [displayedRoutes, setDisplayedRoutes] = useState<DisplayRoute[]>([]);
  const [generatedData, setGeneratedData] = useState<FullAnnouncement | null>(null);
  const [searchNumber, setSearchNumber] = useState('');
  const [searchName, setSearchName] = useState('');
  const { toast } = useToast();

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
    setDisplayedRoutes(selectedRoutes.map(r => ({ ...r, platform: '1', category: 'Arriving' })));
    setIsRouteModalOpen(false);
  };
  
  const handleSearchByNumber = () => {
    const results = allRoutes.filter(route =>
      route['Train Number'].includes(searchNumber)
    );
    setDisplayedRoutes(results.map(r => ({ ...r, platform: '1', category: 'Arriving' })));
  };

  const handleSearchByName = () => {
    const results = allRoutes.filter(route =>
      route['Train Name'].toLowerCase().includes(searchName.toLowerCase())
    );
    setDisplayedRoutes(results.map(r => ({ ...r, platform: '1', category: 'Arriving' })));
  };

  const clearSearch = () => {
    setSearchNumber('');
    setSearchName('');
    setDisplayedRoutes([]);
    setSelectedRoutes([]);
  }

  const handlePlatformChange = (routeId: number | undefined, platform: string) => {
    if (routeId === undefined) return;
    setDisplayedRoutes(prev =>
      prev.map(r => (r.id === routeId ? { ...r, platform } : r))
    );
  };

  const handleCategoryChange = (routeId: number | undefined, category: string) => {
    if (routeId === undefined) return;
    setDisplayedRoutes(prev =>
      prev.map(r => (r.id === routeId ? { ...r, category } : r))
    );
  };
  
  const onGenerateAnnouncement = async (route: DisplayRoute) => {
    if (!route.id) return;
    setIsGenerating(true);
    try {
        const result = await handleGenerateAnnouncement({
            routeId: route.id,
            platform: route.platform,
            category: route.category
        });
        setGeneratedData(result);
        setIsAnnouncementModalOpen(true);
    } catch(error) {
        console.error("Announcement generation failed:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to generate announcement. Please ensure translations and audio are generated for this route and its template."
        })
    } finally {
        setIsGenerating(false);
    }
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
                        <Dialog open={isRouteModalOpen} onOpenChange={setIsRouteModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" onClick={() => setSelectedRoutes([])}>Pick Route</Button>
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
                                <Button variant="outline" onClick={() => setIsRouteModalOpen(false)}>Cancel</Button>
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
                         <Dialog open={isRouteModalOpen} onOpenChange={setIsRouteModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" onClick={() => setSelectedRoutes([])}>Pick Route</Button>
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
                                <Button variant="outline" onClick={() => setIsRouteModalOpen(false)}>Cancel</Button>
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
                            <TableHead className="w-[120px]">Platform</TableHead>
                            <TableHead className="w-[200px]">Category</TableHead>
                             <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedRoutes.map(route => (
                            <TableRow key={route.id}>
                                <TableCell>{route['Train Number']}</TableCell>
                                <TableCell>{route['Train Name']}</TableCell>
                                <TableCell>{route['Start Station']}</TableCell>
                                <TableCell>{route['End Station']}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={route.platform}
                                        onChange={(e) => handlePlatformChange(route.id, e.target.value)}
                                        className="h-8"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={route.category}
                                        onValueChange={(value) => handleCategoryChange(route.id, value)}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ANNOUNCEMENT_CATEGORIES.map(category => (
                                                <SelectItem key={category} value={category}>
                                                    {category.replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => onGenerateAnnouncement(route)} disabled={isGenerating}>
                                                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Generate announcement</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}

      <Dialog open={isGenerating && !isAnnouncementModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Generating Announcement</DialogTitle>
                <DialogDescription>
                    Please wait while the text, audio, and video are being generated. This may take a moment.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4 items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Processing...</p>
            </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAnnouncementModalOpen} onOpenChange={setIsAnnouncementModalOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
                <DialogTitle>Generated Announcement</DialogTitle>
                 <DialogDescription>
                    Review the generated text, audio, and ISL video for the announcement.
                </DialogDescription>
            </DialogHeader>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden pt-2">
                <div className="flex flex-col h-full">
                    <div className="max-h-full overflow-y-auto space-y-4 pr-4">
                        {generatedData?.announcements.map(ann => (
                           <Card key={ann.language_code}>
                               <CardHeader>
                                   <CardTitle className="text-lg">{LANGUAGE_MAP[ann.language_code]}</CardTitle>
                               </CardHeader>
                               <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Generated Text:</h4>
                                        <p className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/50">{ann.text}</p>
                                    </div>
                                    <div>
                                         <h4 className="font-semibold text-sm mb-1">Generated Audio:</h4>
                                         {ann.audio_path ? (
                                            <audio controls className="w-full h-10" key={ann.audio_path}>
                                                <source src={ann.audio_path} type="audio/wav" />
                                                Your browser does not support the audio element.
                                            </audio>
                                         ) : (
                                            <p className="text-sm text-destructive">Audio generation failed. Ensure all source audio files exist.</p>
                                         )}
                                    </div>
                               </CardContent>
                           </Card>
                        ))}
                    </div>
                </div>

                <div className="h-full overflow-hidden">
                     {generatedData && <IslVideoPlayer playlist={generatedData.isl_video_playlist} />}
                </div>

             </div>
            <DialogFooter className="mt-4">
                <Button onClick={() => setIsAnnouncementModalOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getIslVideos } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FolderKanban } from 'lucide-react';

export default function IslDatasetPage() {
  const [videos, setVideos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const videoPaths = await getIslVideos();
        setVideos(videoPaths);
        if (videoPaths.length === 0) {
          toast({
            title: 'No Videos Found',
            description: 'The ISL dataset directory is empty or does not exist.',
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch ISL dataset videos.',
        });
        console.error('Failed to fetch ISL videos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, [toast]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" />
            ISL Dataset
          </h1>
          <p className="text-muted-foreground">
            A collection of pre-recorded ISL videos for various words and phrases.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((videoSrc) => {
              const fileName = videoSrc.split('/').pop()?.replace('.mp4', '').replace(/_/g, ' ') ?? 'video';
              return (
                <Card key={videoSrc}>
                  <CardHeader>
                    <CardTitle className="text-base capitalize">{fileName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <video controls className="w-full rounded-md" muted>
                      <source src={videoSrc} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 text-center text-muted-foreground border rounded-lg p-12">
            <p>No videos found in the ISL dataset.</p>
            <p className="text-sm">
              Add `.mp4` files to the `public/isl_dataset` directory to see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

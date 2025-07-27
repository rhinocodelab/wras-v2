
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { getTranslations, FullTranslationInfo } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronRight } from 'lucide-react';

const LANGUAGE_MAP: { [key: string]: string } = {
  'en': 'English',
  'mr': 'Marathi',
  'hi': 'Hindi',
  'gu': 'Gujarati',
};

export default function TranslationsPage({ onViewChange }: { onViewChange: (view: string) => void }) {
  const [translations, setTranslations] = useState<FullTranslationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleFetchTranslations = async () => {
      setIsLoading(true);
      try {
        const data = await getTranslations();
        setTranslations(data);
        if (data.length === 0) {
          toast({
            title: 'No Data',
            description: 'No translations found. Please generate them from the Route Management page.',
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch translations.',
        });
        console.error('Failed to fetch translations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    handleFetchTranslations();
  }, [toast]);


  return (
    <div className="w-full">
       <div className="flex items-center text-sm text-muted-foreground mb-4">
            <a onClick={() => onViewChange('ai-database')} className="cursor-pointer hover:text-primary">AI Database</a>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-foreground">AI Generated Text Translation</span>
        </div>

        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-lg font-semibold md:text-2xl">Route Translations</h1>
            <p className="text-muted-foreground">
                Displaying translated text for all train routes.
            </p>
            </div>
      </div>
     
        <div className="mt-6">
          {isLoading ? (
             <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : translations.length > 0 ? (
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                    {translations.map((item) => (
                        <div key={item.train_number} className="rounded-md border">
                        <div className="bg-muted p-3">
                            <h3 className="font-semibold">{item.train_name} ({item.train_number})</h3>
                        </div>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Language</TableHead>
                                <TableHead>Train Number</TableHead>
                                <TableHead>Train Name</TableHead>
                                <TableHead>Start Station</TableHead>
                                <TableHead>End Station</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {item.translations.map((t) => (
                                <TableRow key={t.language_code}>
                                <TableCell className="font-medium">{LANGUAGE_MAP[t.language_code] || t.language_code}</TableCell>
                                <TableCell>{t.train_number_translation}</TableCell>
                                <TableCell>{t.train_name_translation}</TableCell>
                                <TableCell>{t.start_station_translation}</TableCell>
                                <TableCell>{t.end_station_translation}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </div>
                    ))}
                    </div>
                </CardContent>
            </Card>
          ) : (
            <div className="mt-6 text-center text-muted-foreground border rounded-lg p-12">
              <p>No translation data to display.</p>
              <p className='text-sm'>Please generate translations from the Route Management page.</p>
            </div>
          )}
        </div>
    </div>
  );
}

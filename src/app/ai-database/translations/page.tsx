
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getTranslations, FullTranslationInfo, TranslationRecord } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronRight } from 'lucide-react';

const LANGUAGE_MAP: { [key: string]: string } = {
  'en': 'English',
  'mr': 'Marathi',
  'hi': 'Hindi',
  'gu': 'Gujarati',
};

const RECORDS_PER_PAGE = 5;

export default function TranslationsPage({ onViewChange }: { onViewChange: (view: string) => void }) {
  const [allTranslations, setAllTranslations] = useState<FullTranslationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleFetchTranslations = async () => {
      setIsLoading(true);
      try {
        const data = await getTranslations();
        setAllTranslations(data);
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

  const totalPages = Math.ceil(allTranslations.length / RECORDS_PER_PAGE);
  const paginatedTranslations = allTranslations.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  const getTranslationForLang = (item: FullTranslationInfo, langCode: string) => {
    return item.translations.find(t => t.language_code === langCode) || null;
  }
  
  const getEnglishTranslation = (item: FullTranslationInfo) => {
    return getTranslationForLang(item, 'en');
  }

  const handleOpenModal = (translation: TranslationRecord | null) => {
    setSelectedTranslation(translation);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };


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
          ) : allTranslations.length > 0 ? (
            <Dialog>
                <Card>
                    <CardContent className="pt-6">
                       <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Train Number</TableHead>
                                <TableHead>Train Name</TableHead>
                                <TableHead>Start Station</TableHead>
                                <TableHead>End Station</TableHead>
                                <TableHead>Translations</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {paginatedTranslations.map((item) => {
                                const englishVersion = getEnglishTranslation(item);
                                return (
                                <TableRow key={item.train_number}>
                                    <TableCell>{item.train_number}</TableCell>
                                    <TableCell>{item.train_name}</TableCell>
                                    <TableCell>{englishVersion?.start_station_translation || 'N/A'}</TableCell>
                                    <TableCell>{englishVersion?.end_station_translation || 'N/A'}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => handleOpenModal(getTranslationForLang(item, 'hi'))}>Hindi</Button>
                                        </DialogTrigger>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => handleOpenModal(getTranslationForLang(item, 'mr'))}>Marathi</Button>
                                        </DialogTrigger>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => handleOpenModal(getTranslationForLang(item, 'gu'))}>Gujarati</Button>
                                        </DialogTrigger>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>
                 {totalPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedTranslation ? `${LANGUAGE_MAP[selectedTranslation.language_code]} Translation` : 'Translation'}
                        </DialogTitle>
                        <DialogDescription>
                            Showing the translated details for the selected language.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTranslation ? (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <p className="text-right font-semibold">Train Name</p>
                                <p className="col-span-3">{selectedTranslation.train_name_translation}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <p className="text-right font-semibold">Train Number</p>
                                <p className="col-span-3">{selectedTranslation.train_number_translation}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <p className="text-right font-semibold">Start Station</p>
                                <p className="col-span-3">{selectedTranslation.start_station_translation}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <p className="text-right font-semibold">End Station</p>
                                <p className="col-span-3">{selectedTranslation.end_station_translation}</p>
                            </div>
                        </div>
                    ) : (
                        <p>No translation data available for the selected language.</p>
                    )}
                </DialogContent>
            </Dialog>
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

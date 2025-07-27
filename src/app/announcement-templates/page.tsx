
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, ClipboardList } from 'lucide-react';

const ANNOUNCEMENT_CATEGORIES = ['Arriving', 'Delay', 'Cancelled', 'Platform_Change'];
const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Gujarati'];

type Template = {
  category: string;
  language_code: string;
  template_text: string;
};

export default function AnnouncementTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) {
      processFile(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please drop a valid .json file.',
      });
    }
  };
  
  const processFileContent = async (content: string) => {
      try {
        const parsedTemplates = JSON.parse(content);

        // Basic validation
        for (const category of ANNOUNCEMENT_CATEGORIES) {
            if(!parsedTemplates[category] || typeof parsedTemplates[category] !== 'string'){
                throw new Error(`Template for category "${category}" is missing or invalid.`)
            }
        }
        
        setIsProcessing(true);
        // Here you would call a server action to process and translate the templates
        // For now, we'll just simulate it and display the English version
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

        const newTemplates: Template[] = Object.entries(parsedTemplates).map(([category, template_text]) => ({
            category,
            language_code: 'en',
            template_text: template_text as string
        }));

        setTemplates(newTemplates);

        toast({
          title: 'Processing Complete',
          description: 'Templates have been translated and saved (simulation).',
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'File Error',
          description: `Failed to process file: ${error.message}`,
        });
      } finally {
        setIsProcessing(false);
      }
  }

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      await processFileContent(content);
    };
    reader.readAsText(file);
  };

  const handleUseSample = async () => {
    try {
        const response = await fetch('/sample_annoucement_template/announcement_templates.json');
        if (!response.ok) {
            throw new Error('Failed to load sample templates.');
        }
        const content = await response.text();
        await processFileContent(content);
    } catch (error: any) {
         toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
    }
  }


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const getTemplate = (category: string, lang: string) => {
    const langCode = lang.substring(0,2).toLowerCase();
    return templates.find(t => t.category === category && t.language_code === langCode)?.template_text || 'N/A';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Announcement Templates
          </h1>
          <p className="text-muted-foreground">
            Upload and manage multilingual announcement templates.
          </p>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Templates</CardTitle>
                    <CardDescription>Upload a JSON file or use our sample templates to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md transition-colors
                        ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                    >
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                        Drag & drop your .json file here
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">or</p>
                         <div className="flex gap-2">
                            <Input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".json"
                            onChange={handleFileUpload}
                            />
                            <label
                            htmlFor="file-upload"
                            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                            Browse File
                            </label>
                            <Button variant="secondary" onClick={handleUseSample}>Use Sample</Button>
                        </div>
                    </div>
                     <div className="mt-4 text-xs text-muted-foreground">
                        <p>The JSON file should be an object with keys for each category:</p>
                        <pre className="mt-2 p-2 bg-muted rounded-md text-xs">
                            {`{\n  "Arriving": "...",\n  "Delay": "...",\n  "Cancelled": "...",\n  "Platform_Change": "..."\n}`}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
           <Card>
                <CardHeader>
                    <CardTitle>Current Templates</CardTitle>
                    <CardDescription>
                        These are the templates currently loaded in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : templates.length > 0 ? (
                        <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                {LANGUAGES.map(lang => (
                                    <TableHead key={lang}>{lang}</TableHead>
                                ))}
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {ANNOUNCEMENT_CATEGORIES.map(category => (
                                <TableRow key={category}>
                                <TableCell className="font-medium">{category.replace('_', ' ')}</TableCell>
                                {LANGUAGES.map(lang => (
                                    <TableCell key={lang} className="text-xs">{getTemplate(category, lang)}</TableCell>
                                ))}
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-12 border rounded-md">
                            <p>No templates loaded.</p>
                            <p className='text-sm'>Upload a JSON file or use the sample to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      
       <Dialog open={isProcessing}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Processing Templates</DialogTitle>
                    <DialogDescription>
                        Please wait while templates are being translated and saved.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4 items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Processing...</p>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}

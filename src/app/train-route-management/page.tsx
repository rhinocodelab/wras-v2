
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';
import { saveTrainRoutes, getTrainRoutes, TrainRoute } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const sampleData: TrainRoute[] = [
  {
    'Train Number': '12951',
    'Train Name': 'MUMBAI RAJDHANI',
    'Start Station': 'MUMBAI CENTRAL',
    'Start Code': 'MMCT',
    'End Station': 'NEW DELHI',
    'End Code': 'NDLS',
  },
  {
    'Train Number': '12953',
    'Train Name': 'A. K. RAJDHANI',
    'Start Station': 'MUMBAI CENTRAL',
    'Start Code': 'MMCT',
    'End Station': 'H NIZAMUDDIN',
    'End Code': 'NZM',
  },
];

export default function TrainRouteManagementPage() {
  const [data, setData] = useState<TrainRoute[]>([]);
  const [fileName, setFileName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const recordsPerPage = 7;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = data.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(data.length / recordsPerPage);

  useEffect(() => {
    async function fetchRoutes() {
      const routes = await getTrainRoutes();
      setData(routes);
    }
    fetchRoutes();
  }, []);
  
  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const headers = json[0] as string[];
        const routes: TrainRoute[] = (json.slice(1) as any[]).map(
          (row: any[]) => {
            const route: any = {};
            headers.forEach((header, i) => {
              route[header] = row[i];
            });
            return route as TrainRoute;
          }
        );

        const result = await saveTrainRoutes(routes);
        const latestRoutes = await getTrainRoutes();
        setData(latestRoutes);
        setCurrentPage(1); // Reset to first page after import
        setIsModalOpen(false);
        toast({
          title: "Success",
          description: result.message,
        });

      } catch (error) {
        console.error("Failed to process or save file:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to import routes. Please check the file format and try again.",
        });
      }
    };
    reader.readAsBinaryString(file);
  };

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
    if (file && file.name.endsWith('.xlsx')) {
      processFile(file);
    } else {
       toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please drop a valid .xlsx file.",
      });
    }
  };

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
  
  const prevPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage !== nPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">
            Train Route Management
          </h1>
          <p className="text-muted-foreground">
            Upload and manage train route information.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          Import
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Train Routes</DialogTitle>
            <DialogDescription>
              Drag and drop an .xlsx file or click browse to upload.
            </DialogDescription>
          </DialogHeader>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md transition-colors
              ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
          >
            <Upload className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground mb-2">
              Drag & drop your .xlsx file here
            </p>
            <p className="text-xs text-muted-foreground mb-2">or</p>
            <Input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".xlsx"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Browse File
            </label>
          </div>

          <div className="mt-2">
            <h3 className="text-xs font-medium text-foreground mb-1">
              Expected Excel Format:
            </h3>
            <div className="rounded-md border">
              <Table className="text-[10px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-7 px-2">Train Number</TableHead>
                    <TableHead className="h-7 px-2">Train Name</TableHead>
                    <TableHead className="h-7 px-2">Start Station</TableHead>
                    <TableHead className="h-7 px-2">End Station</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.slice(0, 1).map((row, index) => (
                    <TableRow key={index} className="h-7">
                      <TableCell className="p-2">{row['Train Number']}</TableCell>
                      <TableCell className="p-2">{row['Train Name']}</TableCell>
                      <TableCell className="p-2">{row['Start Station']}</TableCell>
                      <TableCell className="p-2">{row['End Station']}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {fileName && (
        <p className="mt-4 text-sm text-muted-foreground">
          Loaded routes from: <strong>{fileName}</strong>
        </p>
      )}

      <div className="mt-4 rounded-lg border">
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
            {currentRecords.length > 0 ? (
              currentRecords.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row['Train Number']}</TableCell>
                  <TableCell>{row['Train Name']}</TableCell>
                  <TableCell>
                    <div>{row['Start Station']}</div>
                    <Badge variant="secondary">{row['Start Code']}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>{row['End Station']}</div>
                    <Badge variant="secondary">{row['End Code']}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No data available. Import an Excel file to see routes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {data.length > recordsPerPage && (
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
            Page {currentPage} of {nPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === nPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );

    
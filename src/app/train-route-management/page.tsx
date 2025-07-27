
'use client';

import { useState } from 'react';
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

type TrainRoute = {
  'Train Number': string;
  'Train Name': string;
  'Start Station': string;
  'Start Code': string;
  'End Station': string;
  'End Code': string;
};

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

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
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
      setData(routes);
      setIsModalOpen(false); // Close modal after successful upload
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
        <DialogContent className="sm:max-w-2xl">
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
            className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg transition-colors
              ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
          >
            <Upload className="w-10 h-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              Drag & drop your .xlsx file here
            </p>
            <p className="text-xs text-muted-foreground mb-4">or</p>
            <Input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".xlsx"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Browse File
            </label>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Expected Excel Format:
            </h3>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Train Number</TableHead>
                    <TableHead>Train Name</TableHead>
                    <TableHead>Start Station</TableHead>
                    <TableHead>Start Code</TableHead>
                    <TableHead>End Station</TableHead>
                    <TableHead>End Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row['Train Number']}</TableCell>
                      <TableCell>{row['Train Name']}</TableCell>
                      <TableCell>{row['Start Station']}</TableCell>
                      <TableCell>{row['Start Code']}</TableCell>
                      <TableCell>{row['End Station']}</TableCell>
                      <TableCell>{row['End Code']}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
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
              <TableHead>Start Code</TableHead>
              <TableHead>End Station</TableHead>
              <TableHead>End Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row['Train Number']}</TableCell>
                  <TableCell>{row['Train Name']}</TableCell>
                  <TableCell>{row['Start Station']}</TableCell>
                  <TableCell>{row['Start Code']}</TableCell>
                  <TableCell>{row['End Station']}</TableCell>
                  <TableCell>{row['End Code']}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No data available. Import an Excel file to see routes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


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

export default function TrainRouteManagementPage() {
  const [data, setData] = useState<TrainRoute[]>([]);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      };
      reader.readAsBinaryString(file);
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
            <div className="flex items-center gap-2">
              <Input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".xlsx"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload .xlsx
              </label>
            </div>
          </div>

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
                      No data available. Upload an Excel file to see routes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
    </div>
  );
}

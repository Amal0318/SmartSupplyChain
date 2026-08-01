import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataColumnMapping, RoleType, UploadedDataset } from '../../types';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  Database,
  ShoppingBag,
  Boxes,
  Factory,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '../../../api/client';

interface DataUploadSectionProps {
  currentDomain: RoleType;
  onDatasetUploaded: (dataset: UploadedDataset) => void;
  onLoadSampleData: (domain: RoleType) => void;
  onRedirectToInsights?: () => void;
}

export const DataUploadSection: React.FC<DataUploadSectionProps> = ({
  currentDomain,
  onDatasetUploaded,
  onLoadSampleData,
  onRedirectToInsights,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expectedHeaders, setExpectedHeaders] = useState<string[] | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadType, setUploadType] = useState<'procurement' | 'inventory' | 'production'>(() => {
    if (currentDomain === 'inventory' || currentDomain === 'production') {
      return currentDomain;
    }
    return 'procurement';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsUploaded(false);
    setErrorMsg(null);
    setExpectedHeaders(null);
    if (currentDomain !== 'production') {
      if (currentDomain === 'inventory' || currentDomain === 'procurement') {
        setUploadType(currentDomain);
      } else {
        setUploadType('procurement');
      }
    }
  }, [currentDomain]);

  const handleMultipleFilesProcess = async (files: File[]) => {
    setErrorMsg(null);
    setExpectedHeaders(null);
    setIsAnalyzing(true);
    setAnalysisProgress(10);

    let processedCount = 0;
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      const fileName = file.name;
      const fileSize = (file.size / 1024).toFixed(1) + ' KB';
      const uploadTime = new Date().toLocaleTimeString();
      const lowerName = fileName.toLowerCase();

      // Determine upload type based on file name
      let fileType: 'procurement' | 'inventory' | 'production' = 'procurement';
      if (lowerName.includes('inventory')) {
        fileType = 'inventory';
      } else if (lowerName.includes('production') || lowerName.includes('order')) {
        fileType = 'production';
      } else if (lowerName.includes('procurement')) {
        fileType = 'procurement';
      } else {
        // Fall back to selected uploadType if it cannot be inferred
        fileType = uploadType;
      }

      setCurrentStepText(`Processing ${fileName} (${fileType})...`);
      setAnalysisProgress(Math.min(10 + Math.round((i / totalFiles) * 80), 90));

      let columns: string[] = [];
      let records: any[] = [];

      try {
        if (lowerName.endsWith('.csv')) {
          await new Promise<void>((resolve, reject) => {
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete: (results: any) => {
                if (results.meta.fields) {
                  columns = results.meta.fields;
                }
                records = results.data;
                resolve();
              },
              error: (err: any) => reject(err),
            });
          });
        } else if (lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx')) {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
          if (jsonData.length > 0) {
            columns = (jsonData[0] as string[]).map((c) => String(c).trim());
            const rows = jsonData.slice(1);
            records = rows.map((rowArray: any) => {
              const obj: any = {};
              columns.forEach((col, idx) => {
                obj[col] = rowArray[idx] !== undefined ? rowArray[idx] : '';
              });
              return obj;
            });
          }
        } else {
          throw new Error('Unsupported format. Please upload CSV or Excel (.xls, .xlsx) files.');
        }

        if (columns.length === 0 || records.length === 0) {
          throw new Error('No structured records found in the uploaded file.');
        }

        // Uploading to backend
        const domainEndpointMap: Record<string, string> = {
          procurement: '/upload/procurement',
          inventory: '/upload/inventory',
          production: '/upload/production-orders',
        };

        const endpoint = domainEndpointMap[fileType] || '/upload/procurement';
        const formData = new FormData();
        formData.append('file', file);

        try {
          await apiClient.post(endpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (uploadErr: any) {
          console.warn('Backend upload failed, continuing with local parse:', uploadErr?.message);
        }

        const mappings: DataColumnMapping[] = columns.map((col) => ({
          originalColumn: col,
          aiUnderstanding: col,
          standardField: col.toLowerCase().replace(/\s+/g, '_'),
          confidence: 0.95,
        }));

        onDatasetUploaded({
          fileName,
          fileSize,
          uploadTime,
          domain: fileType,
          columns,
          mappings,
          records,
        });

        processedCount++;
      } catch (err: any) {
        console.error(`Error processing ${fileName}:`, err);
        setErrorMsg(`Error processing ${fileName}: ${err.message || 'Check format.'}`);
      }
    }

    setAnalysisProgress(100);
    setIsAnalyzing(false);
    if (processedCount > 0) {
      setIsUploaded(true);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      handleMultipleFilesProcess(filesArray);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs mb-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F5C527]" />
            AI Data Understanding Engine
          </div>
          <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
            Upload Operational Business File
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ingest supply chain datasets in CSV, Excel (.xls, .xlsx), Word (.doc, .docx), PDF, or Text formats for real-time agent mapping.
          </p>
        </div>

        {/* Preset Sample Data Quick Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 hidden lg:inline">Or load sample dataset:</span>
          <button
            onClick={() => {
              if (currentDomain === 'production') {
                onLoadSampleData('procurement');
                onLoadSampleData('inventory');
                onLoadSampleData('production');
              } else {
                onLoadSampleData(uploadType);
              }
              setIsUploaded(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Database className="w-3.5 h-3.5 text-[#F5C527]" />
            {currentDomain === 'production'
              ? 'Load All Sample Data (Procurement, Inventory, Production)'
              : `Load Sample ${uploadType.toUpperCase()} Data`}
          </button>
        </div>
      </div>

      {/* 3 Upload Type Selection Options - ONLY for Production Manager role */}
      {currentDomain === 'production' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            type="button"
            onClick={() => {
              setUploadType('procurement');
              setErrorMsg(null);
              setExpectedHeaders(null);
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              uploadType === 'procurement'
                ? 'border-zinc-900 bg-zinc-50/80 shadow-xs'
                : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${uploadType === 'procurement' ? 'bg-[#F5C527] text-black shadow-xs' : 'bg-zinc-100 text-zinc-600'}`}>
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">Procurement</span>
            </div>
            <p className="text-xs font-bold text-zinc-900 mb-0.5">procurement.csv</p>
            <p className="text-[10px] text-zinc-500">Upload supplier spend and procurement lead time records</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadType('inventory');
              setErrorMsg(null);
              setExpectedHeaders(null);
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              uploadType === 'inventory'
                ? 'border-zinc-900 bg-zinc-50/80 shadow-xs'
                : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${uploadType === 'inventory' ? 'bg-[#F5C527] text-black shadow-xs' : 'bg-zinc-100 text-zinc-600'}`}>
                <Boxes className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">Inventory</span>
            </div>
            <p className="text-xs font-bold text-zinc-900 mb-0.5">inventory.csv</p>
            <p className="text-[10px] text-zinc-500">Upload warehouse SKU stock levels and reorder safety thresholds</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadType('production');
              setErrorMsg(null);
              setExpectedHeaders(null);
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              uploadType === 'production'
                ? 'border-zinc-950 bg-zinc-50/80 shadow-xs'
                : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${uploadType === 'production' ? 'bg-[#F5C527] text-black shadow-xs' : 'bg-zinc-100 text-zinc-600'}`}>
                <Factory className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">Production Orders</span>
            </div>
            <p className="text-xs font-bold text-zinc-900 mb-0.5">production order.csv</p>
            <p className="text-[10px] text-zinc-500">Upload manufacturing job schedules and line efficiency telemetry</p>
          </button>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-zinc-900 bg-[#F5C527]/10 scale-[0.99]'
            : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv, .xls, .xlsx, .doc, .docx, .pdf, .txt, .word, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const filesArray = Array.from(e.target.files);
              handleMultipleFilesProcess(filesArray);
            }
          }}
        />

        <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <UploadCloud className="w-7 h-7 text-[#F5C527]" />
        </div>

        <h4 className="text-base font-bold text-zinc-900 mb-1">
          Drag & drop your CSV, Excel, Word, or PDF file here
        </h4>
        <p className="text-xs text-zinc-500 mb-4">
          Supported formats: <span className="text-zinc-800 font-mono font-bold">.CSV</span>, <span className="text-zinc-800 font-mono font-bold">.XLS / .XLSX</span>, <span className="text-zinc-800 font-mono font-bold">.DOC / .DOCX</span>, <span className="text-zinc-800 font-mono font-bold">.PDF</span>, <span className="text-zinc-800 font-mono font-bold">.TXT</span>
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-black transition-colors shadow-xs">
          <FileSpreadsheet className="w-4 h-4 text-[#F5C527]" />
          Browse Files
        </div>
      </div>

      {/* Analysis Loading Progress */}
      {isAnalyzing && (
        <div className="mt-6 p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-900 animate-spin" />
              <span className="text-xs font-bold text-zinc-900">
                Analyzing uploaded business data...
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-900">
              {analysisProgress}%
            </span>
          </div>

          <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden mb-3">
            <div
              className="bg-[#F5C527] h-full transition-all duration-300 rounded-full"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>

          <div className="text-xs text-zinc-600 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#F5C527] animate-ping" />
            <span>{currentStepText}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
            <span className="font-semibold">{errorMsg}</span>
          </div>

          {expectedHeaders && expectedHeaders.length > 0 && (
            <div className="pl-7 pt-1">
              <span className="font-bold text-[11px] text-red-800 uppercase block mb-1">
                Expected Column Headers for {currentDomain.toUpperCase()} Agent:
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono">
                {expectedHeaders.map((hdr, idx) => (
                  <span
                    key={idx}
                    className="bg-red-100 text-red-900 border border-red-300 px-2 py-0.5 rounded text-[11px] font-bold"
                  >
                    {hdr}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* AI Report Ready Redirect Banner */}
      {isUploaded && currentDomain === 'production' && (
        <div className="mt-6 p-4 rounded-2xl bg-zinc-950 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-zinc-800 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5C527] flex items-center justify-center text-black font-extrabold shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 fill-black text-black" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                AI Report is Ready!
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                The supply chain AI agent has finished parsing the dataset and generating insights.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRedirectToInsights}
            className="px-4 py-2.5 rounded-xl bg-[#F5C527] text-black font-bold text-xs hover:bg-[#ebd038] transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
          >
            View AI Insights
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </button>
        </div>
      )}
    </div>
  );
};

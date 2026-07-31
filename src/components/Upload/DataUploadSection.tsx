import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataColumnMapping, RoleType, UploadedDataset } from '../../types';
import { validateDatasetForDomain } from '../../utils/recordNormalizer';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Database,
  FileCode,
} from 'lucide-react';

interface DataUploadSectionProps {
  currentDomain: RoleType;
  onDatasetUploaded: (dataset: UploadedDataset) => void;
  onLoadSampleData: (domain: RoleType) => void;
}

export const DataUploadSection: React.FC<DataUploadSectionProps> = ({
  currentDomain,
  onDatasetUploaded,
  onLoadSampleData,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expectedHeaders, setExpectedHeaders] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setExpectedHeaders(null);
    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setCurrentStepText('Reading file...');

    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(1) + ' KB';
    const uploadTime = new Date().toLocaleTimeString();

    let columns: string[] = [];
    let records: any[] = [];

    const lowerName = fileName.toLowerCase();

    try {
      if (lowerName.endsWith('.csv')) {
        await new Promise<void>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.meta.fields) {
                columns = results.meta.fields;
              }
              records = results.data;
              resolve();
            },
            error: (err) => reject(err),
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
      } else if (
        lowerName.endsWith('.pdf') ||
        lowerName.endsWith('.doc') ||
        lowerName.endsWith('.docx') ||
        lowerName.endsWith('.txt') ||
        lowerName.endsWith('.word')
      ) {
        setAnalysisProgress(30);
        setCurrentStepText('Extracting document & report text for AI Agent...');
        let textContent = '';
        try {
          textContent = await file.text();
        } catch {
          textContent = `Document text extracted from file ${fileName}`;
        }

        const docRes = await fetch('/api/gemini/parse-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileContentText: textContent,
            fileName,
            domain: currentDomain,
          }),
        });
        const docData = await docRes.json();
        if (docData.success && docData.records) {
          columns = docData.columns || Object.keys(docData.records[0] || {});
          records = docData.records;
        } else {
          throw new Error('Failed to parse document contents into tabular records.');
        }
      } else {
        throw new Error('Unsupported format. Please upload CSV, Excel (.xls, .xlsx), Word (.doc, .docx), PDF, or Text files.');
      }

      if (columns.length === 0 || records.length === 0) {
        throw new Error('No structured records found in the uploaded file.');
      }

      // Department-Specific Data Validation
      setAnalysisProgress(25);
      setCurrentStepText('Validating department schema compatibility...');
      const validation = validateDatasetForDomain(columns, records, currentDomain);
      
      if (!validation.isValid) {
        setExpectedHeaders(validation.expectedHeaders || null);
        throw new Error(validation.reason || `Validation Error: This dataset is not compatible with ${currentDomain.toUpperCase()} department.`);
      }

      // Step 2: Detecting columns
      setAnalysisProgress(40);
      setCurrentStepText('Detecting business columns...');
      await new Promise((r) => setTimeout(r, 300));

      // Step 3: Mapping schema via API
      setAnalysisProgress(65);
      setCurrentStepText('Mapping semantic schema with Gemini AI...');

      const response = await fetch('/api/gemini/parse-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columns,
          sampleData: records.slice(0, 5),
          domain: currentDomain,
        }),
      });

      const resData = await response.json();
      const mappings: DataColumnMapping[] = resData.mapping || [];

      // Step 4: Finalizing
      setAnalysisProgress(95);
      setCurrentStepText('Routing verified dataset to AI Agent...');
      await new Promise((r) => setTimeout(r, 300));

      setAnalysisProgress(100);
      setIsAnalyzing(false);

      onDatasetUploaded({
        fileName,
        fileSize,
        uploadTime,
        domain: currentDomain,
        columns,
        mappings,
        records,
      });
    } catch (err: any) {
      console.error(err);
      setIsAnalyzing(false);
      setErrorMsg(err.message || 'Error processing file. Please try again.');
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
      handleFileProcess(e.dataTransfer.files[0]);
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
            onClick={() => onLoadSampleData(currentDomain)}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Database className="w-3.5 h-3.5 text-[#F5C527]" />
            Load Sample {currentDomain.toUpperCase()} Data
          </button>
        </div>
      </div>

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
          accept=".csv, .xls, .xlsx, .doc, .docx, .pdf, .txt, .word, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
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
    </div>
  );
};

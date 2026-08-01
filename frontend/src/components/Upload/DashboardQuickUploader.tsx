import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataColumnMapping, RoleType, UploadedDataset } from '../../types/santhosh';
import { validateDatasetForDomain } from '../../utils/recordNormalizer';
import { UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface DashboardQuickUploaderProps {
  currentDomain: RoleType;
  onDatasetUploaded: (dataset: UploadedDataset) => void;
}

export const DashboardQuickUploader: React.FC<DashboardQuickUploaderProps> = ({
  currentDomain,
  onDatasetUploaded,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUploading(true);
    setProgressText('Ingesting operational dataset...');

    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(1) + ' KB';
    const uploadTime = new Date().toLocaleTimeString();
    const lowerName = fileName.toLowerCase();

    let columns: string[] = [];
    let records: any[] = [];

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
        setProgressText('Parsing document content with Gemini AI...');
        let textContent = '';
        try {
          textContent = await file.text();
        } catch {
          textContent = `Document content from ${fileName}`;
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
          throw new Error('Could not parse document content.');
        }
      } else {
        throw new Error('Unsupported format. Please upload CSV, Excel, Word, PDF, or Text files.');
      }

      if (columns.length === 0 || records.length === 0) {
        throw new Error('No valid records found in file.');
      }

      setProgressText('Validating department schema compatibility...');
      const validation = validateDatasetForDomain(columns, records, currentDomain);
      if (!validation.isValid && currentDomain !== 'master') {
        throw new Error(validation.reason || 'Dataset schema mismatch for this department.');
      }

      setProgressText('AI Agent mapping schema...');
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

      setIsUploading(false);
      setSuccessMsg(`Successfully imported ${records.length} records from ${fileName}!`);

      onDatasetUploaded({
        fileName,
        fileSize,
        uploadTime,
        domain: currentDomain,
        columns,
        mappings,
        records,
      });

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      setErrorMsg(err.message || 'Error processing file upload.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-black text-white rounded-2xl p-4 shadow-sm mb-6 border border-zinc-700/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5C527] text-black flex items-center justify-center font-bold flex-shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F5C527] uppercase tracking-wider">
                Direct Dashboard Ingestion
              </span>
              <span className="text-[10px] bg-zinc-700 text-zinc-200 px-2 py-0.5 rounded-full font-mono">
                CSV • Excel • Word • PDF
              </span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight mt-0.5">
              Upload Operational Data File to {currentDomain.toUpperCase()} Agent
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

          <button
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-[#F5C527] text-black hover:bg-[#e2b51f] font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Upload Data File</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress or status feedback */}
      {isUploading && (
        <div className="mt-3 pt-3 border-t border-zinc-700/60 flex items-center gap-2 text-xs text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-[#F5C527] animate-spin" />
          <span>{progressText}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-3 pt-3 border-t border-zinc-700/60 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 pt-3 border-t border-zinc-700/60 flex items-center gap-2 text-xs text-red-400 font-semibold">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

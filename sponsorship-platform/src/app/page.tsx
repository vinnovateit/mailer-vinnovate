'use client';

import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { UploadCloud, Building2, Mail, ExternalLink, Activity } from 'lucide-react';
import { uploadCompanies, getCompanies } from '@/actions/company';
import EmailDraftModal from '@/components/EmailDraftModal';

interface CSVRow {
  Company: string;
  Email: string;
  Website?: string;
  Industry?: string;
  Contact?: string;
}

export default function Dashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [companies, setCompanies] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCompanies = useCallback(async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Failed to load companies:", error);
    }
  }, []);
  useEffect(() => { 
    let isMounted = true;
    
    const fetchInitialData = async () => {
      const data = await getCompanies();
      if (isMounted) {
        setCompanies(data);
      }
    };
    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, []);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const formattedData = results.data
          .filter((row) => row.Company && row.Email)
          .map((row) => ({
            name: row.Company,
            email: row.Email,
            website: row.Website,
            industry: row.Industry,
            contactName: row.Contact,
          }));

        if (formattedData.length === 0) {
          alert('No valid rows found. Ensure your CSV has "Company" and "Email" columns.');
          setIsUploading(false);
          return;
        }

        const result = await uploadCompanies(formattedData);
        
        if (result.success) {
          await loadCompanies();
        } else {
          alert(`Upload failed: ${result.error}`);
        }
        
        setIsUploading(false);
        e.target.value = '';
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
        setIsUploading(false);
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateAiContent = async (companyData: any) => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: companyData }),
    });
    
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="text-blue-600" />
              Sponsorship Pipeline
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage VinHack 2026 partner outreach</p>
          </div>
          
          <div>
            <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm font-medium">
              <UploadCloud size={20} />
              {isUploading ? 'Uploading...' : 'Import CSV'}
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
            <p className="text-xs text-slate-400 mt-2 text-right">Requires: Company, Email columns</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
                <th className="p-4">Company</th>
                <th className="p-4">Industry</th>
                <th className="p-4">Status</th>
                <th className="p-4">Added</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No companies found. Upload a CSV to get started.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{company.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{company.email}</div>
                      {company.website && (
                        <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                          {company.website} <ExternalLink size={10} />
                        </a>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {company.industry || <span className="text-slate-300">N/A</span>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                        company.status === 'contacted' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        <Activity size={12} />
                        {company.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedCompany(company);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-slate-200 hover:border-blue-200"
                      >
                        <Mail size={16} />
                        Draft Email
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      <EmailDraftModal 
        company={selectedCompany} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onGenerate={generateAiContent}
        onSendSuccess={() => {
          alert('Email dispatched successfully!');
          loadCompanies(); // Re-fetch from DB to see status change from 'lead' to 'contacted'
        }}
      />
    </div>
  );
}
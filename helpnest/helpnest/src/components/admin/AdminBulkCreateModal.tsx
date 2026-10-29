// src/components/admin/AdminBulkCreateModal.tsx
import React, { useState } from 'react';
import { User } from '../../types';
import { db } from '../../services/db';
import { validateBulkUserCsv, CsvValidationSummary } from '../../utils/csv';
import { UploadCloud, CheckCircle2, AlertTriangle, XCircle, FileText, X } from 'lucide-react';

interface AdminBulkCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminActor: User;
  onBulkComplete: () => void;
}

export const AdminBulkCreateModal: React.FC<AdminBulkCreateModalProps> = ({
  isOpen,
  onClose,
  adminActor,
  onBulkComplete
}) => {
  const [csvText, setCsvText] = useState('');
  const [summary, setSummary] = useState<CsvValidationSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'valid' | 'invalid' | 'duplicates'>('create');
  const [creationReport, setCreationReport] = useState<{ createdCount: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const handleValidate = (rawText: string) => {
    setCsvText(rawText);
    const existingEmails = new Set(db.getUsers().map(u => u.email.toLowerCase()));
    const result = validateBulkUserCsv(rawText, existingEmails);
    setSummary(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleValidate(text);
      };
      reader.readAsText(file);
    }
  };

  const handleExecute = () => {
    if (!summary || summary.accountsToCreate.length === 0) return;

    const rowsToProvision = summary.accountsToCreate.map(r => ({
      name: r.name,
      email: r.email,
      role: r.role,
      organization: r.organization
    }));

    const report = db.bulkCreateUsers(rowsToProvision, adminActor);
    setCreationReport(report);
    onBulkComplete();
  };

  const resetAndClose = () => {
    setCsvText('');
    setSummary(null);
    setCreationReport(null);
    onClose();
  };

  const sampleCsv = `name,email,role,organization
Kavita Menon,kavita.menon@college.edu,user,Mount Carmel Student Aid
Rohan Sengupta,rohan.sengupta@community.org,moderator,Red Cross Youth
Ayesha Khan,ayesha.khan@techpark.in,user,Whitefield Commuters`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display">Bulk User Account Creation</h3>
              <p className="text-xs text-indigo-200">Provision organization, college, or community callsets via CSV</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!creationReport ? (
            <>
              {/* Upload & Paste Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Upload CSV File or Paste CSV Data
                  </label>
                  <button
                    type="button"
                    onClick={() => handleValidate(sampleCsv)}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline"
                  >
                    Load Sample CSV
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 text-center bg-slate-50/50 mb-3 transition-colors">
                  <input
                    type="file"
                    id="csvFileInput"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="csvFileInput" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className="w-7 h-7 text-indigo-500 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">Choose CSV File from Computer</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Format: name, email, role, organization</span>
                  </label>
                </div>

                <textarea
                  value={csvText}
                  onChange={(e) => handleValidate(e.target.value)}
                  placeholder="Or paste comma-separated rows here:&#10;name,email,role,organization&#10;John Doe,john@example.com,user,Volunteers"
                  rows={4}
                  className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Validation Summary Cards (Section G) */}
              {summary && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('create')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        activeTab === 'create'
                          ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                        To Create
                      </span>
                      <span className="text-xl font-bold font-display text-indigo-900">
                        {summary.accountsToCreate.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('valid')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        activeTab === 'valid'
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                        Valid Rows
                      </span>
                      <span className="text-xl font-bold font-display text-emerald-900">
                        {summary.validRows.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('invalid')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        activeTab === 'invalid'
                          ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                        Invalid Rows
                      </span>
                      <span className="text-xl font-bold font-display text-rose-900">
                        {summary.invalidRows.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('duplicates')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        activeTab === 'duplicates'
                          ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                        Duplicates
                      </span>
                      <span className="text-xl font-bold font-display text-amber-900">
                        {summary.duplicateRows.length}
                      </span>
                    </button>
                  </div>

                  {/* Tabular Preview */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Row</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Role</th>
                          <th className="py-2 px-3">Status / Errors</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {(activeTab === 'create' ? summary.accountsToCreate :
                          activeTab === 'valid' ? summary.validRows :
                          activeTab === 'invalid' ? summary.invalidRows :
                          summary.duplicateRows).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 text-slate-400">#{row.index}</td>
                            <td className="py-2 px-3 font-sans font-medium text-slate-800">{row.name || '—'}</td>
                            <td className="py-2 px-3 text-slate-600">{row.email || '—'}</td>
                            <td className="py-2 px-3 uppercase text-[11px] text-slate-500">{row.role}</td>
                            <td className="py-2 px-3 font-sans">
                              {row.errors.length === 0 ? (
                                <span className="inline-flex items-center text-emerald-600 gap-1 font-semibold text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                                </span>
                              ) : (
                                <span className="text-rose-600 text-[11px]">
                                  {row.errors.join('; ')}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results Report (Section G) */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-emerald-900">Bulk Account Provisioning Complete</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Successfully created <span className="font-bold">{creationReport.createdCount}</span> accounts.
                </p>
              </div>

              {creationReport.errors.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Skipped Rows ({creationReport.errors.length}):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {creationReport.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                <span className="font-bold block text-slate-700 mb-0.5">Privacy & Audit Policy (Section G):</span>
                New users have been sent automated onboarding notices. Passwords are never generated in plaintext and never appear in downloadable reports.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={resetAndClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 rounded-lg"
          >
            {creationReport ? 'Close' : 'Cancel'}
          </button>
          {!creationReport && (
            <button
              type="button"
              disabled={!summary || summary.accountsToCreate.length === 0}
              onClick={handleExecute}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm"
            >
              Confirm & Create {summary?.accountsToCreate.length || 0} Accounts
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

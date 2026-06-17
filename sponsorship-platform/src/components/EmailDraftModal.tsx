import { useState, useEffect } from 'react';
import { X, CheckCircle2, Send, Loader2 } from 'lucide-react';

interface EmailDraftModalProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    company: any;
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onGenerate: (companyData: any) => Promise<any>;
    onSendSuccess: () => void; // Tells the dashboard to refresh after sending
}

export default function EmailDraftModal({ company, isOpen, onClose, onGenerate, onSendSuccess }: EmailDraftModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiData, setAiData] = useState<any>(null);
  
  // Track which tab is active
  const [selectedVersion, setSelectedVersion] = useState<string>('A');
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editableVariations, setEditableVariations] = useState<any[]>([]);

  // We created a dedicated action
  const handleCloseAndReset = () => {
    setAiData(null);
    setSelectedVersion('A');
    onClose(); // This changes the isOpen prop in the parent
  };

  if (!isOpen) return null;

  const handleGenerateClick = async () => {
    setIsGenerating(true);
    try {
      const data = await onGenerate(company);
      setAiData(data);
      
      // Load the generated variations into our editable state
      if (data?.emailVariations?.length > 0) {
        setEditableVariations(data.emailVariations);
        setSelectedVersion(data.emailVariations[0].version);
      }
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate AI data. Please check your API keys.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Update specific fields when the user types in the inputs
  const handleEdit = (version: string, field: 'subject' | 'body', value: string) => {
    setEditableVariations((prev) => 
      prev.map((v) => v.version === version ? { ...v, [field]: value } : v)
    );
  };

  const handleSendEmail = async () => {
    const finalEmail = editableVariations.find((v) => v.version === selectedVersion);
    if (!finalEmail) return;

    setIsSending(true);
    try {
      // Real production API call to our outbound email service
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company._id,
          toEmail: company.email,
          subject: finalEmail.subject,
          body: finalEmail.body,
          version: finalEmail.version
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSendSuccess(); // Trigger dashboard refresh
        onClose(); // Close the modal
      } else {
        alert(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error("Sending failed", error);
      alert("A network error occurred while sending the email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Sponsorship Outreach</h2>
            <p className="text-sm text-slate-500">Target: {company?.name} ({company?.email})</p>
          </div>
          <button onClick={handleCloseAndReset} disabled={isSending || isGenerating} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-slate-50/50 p-6 flex flex-col items-center">
          
          {/* Initial State */}
          {!aiData && !isGenerating && (
            <div className="my-auto text-center space-y-4 max-w-sm">
              <div className="bg-blue-50 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Ready to Analyze</h3>
              <p className="text-sm text-slate-500">
                Our AI will research {company?.name} and generate 4 custom email variations based on VinHack 2026 goals.
              </p>
              <button 
                onClick={handleGenerateClick}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
              >
                Start AI Generation
              </button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="my-auto text-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <h3 className="text-lg font-medium text-slate-800">Analyzing {company?.name}...</h3>
              <p className="text-sm text-slate-500">Drafting 4 unique outreach variations.</p>
            </div>
          )}

          {/* Results State */}
          {aiData && editableVariations.length > 0 && !isGenerating && (
            <div className="w-full flex gap-6 h-full overflow-hidden">
              
              {/* Left Column: AI Analysis */}
              <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Company Intelligence</h4>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block mb-1">Industry</span>
                      <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-md">{aiData.analysis.industry}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block mb-1">Fit Score</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${aiData.analysis.fitScore > 75 ? 'bg-green-500' : aiData.analysis.fitScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${aiData.analysis.fitScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{aiData.analysis.fitScore}/100</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block mb-1">Recommended Angle</span>
                      <p className="text-sm text-slate-700 leading-relaxed">{aiData.analysis.recommendedAngle}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Email Editor */}
              <div className="w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex border-b border-slate-100 bg-slate-50/50">
                  {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    editableVariations.map((variation: any) => (

                    <button
                      key={variation.version}
                      onClick={() => setSelectedVersion(variation.version)}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                        selectedVersion === variation.version 
                          ? 'border-blue-600 text-blue-700 bg-white' 
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Version {variation.version}
                      <span className="block text-xs font-normal text-slate-400 mt-0.5 truncate">{variation.focus}</span>
                    </button>
                  ))}
                </div>

                <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
                  {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    editableVariations.map((variation: any) => (
                     variation.version === selectedVersion && (
                      <div key={variation.version} className="space-y-4 h-full flex flex-col">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 block mb-1">Subject Line</label>
                          <input 
                            type="text" 
                            value={variation.subject} 
                            onChange={(e) => handleEdit(variation.version, 'subject', e.target.value)}
                            className="w-full text-sm p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                          />
                        </div>
                        <div className="flex-1 flex flex-col h-full">
                          <label className="text-xs font-semibold text-slate-500 block mb-1">Email Body</label>
                          <textarea 
                            value={variation.body} 
                            onChange={(e) => handleEdit(variation.version, 'body', e.target.value)}
                            className="w-full flex-1 min-h-[250px] text-sm p-4 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-slate-700 leading-relaxed"
                          />
                        </div>
                      </div>
                     )
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        {aiData && !isGenerating && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <CheckCircle2 size={16} /> Ready to Dispatch
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleCloseAndReset}
                disabled={isSending}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={isSending}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
                {isSending ? 'Sending...' : `Send Version ${selectedVersion}`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
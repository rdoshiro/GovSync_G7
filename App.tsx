import React, { useState } from 'react';
import { AppView, ProcessingSession } from './types';
import { Dashboard } from './components/Dashboard';
import { Scanner } from './components/Scanner';
import { AnalysisResult } from './components/AnalysisResult';
import { analyzeLicenseImage } from './services/geminiService';
import { LayoutDashboard, History, Settings, LogOut, ChevronLeft, Save, Printer } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [session, setSession] = useState<ProcessingSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize a new session
  const startSession = () => {
    setSession({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      status: 'scanning',
      imagePreviewUrl: null,
      licenseData: null,
      equivalency: null
    });
    setCurrentView(AppView.PROCESS_TRANSFER);
    setError(null);
  };

  // Handle Scan Logic
  const handleScan = async (imageDataUrl: string) => {
    if (!session) return;
    
    setSession(prev => prev ? { ...prev, status: 'analyzing', imagePreviewUrl: imageDataUrl } : null);
    
    try {
      const result = await analyzeLicenseImage(imageDataUrl);
      setSession(prev => prev ? {
        ...prev,
        status: 'review',
        licenseData: result.licenseData,
        equivalency: result.equivalency
      } : null);
    } catch (err: any) {
      setError(err.message || "Failed to analyze document");
      setSession(prev => prev ? { ...prev, status: 'error' } : null);
    }
  };

  const resetSession = () => {
    setSession(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const renderContent = () => {
    if (currentView === AppView.DASHBOARD) {
      return <Dashboard setView={(view) => {
        if (view === AppView.PROCESS_TRANSFER) startSession();
        else setCurrentView(view);
      }} />;
    }

    if (currentView === AppView.PROCESS_TRANSFER && session) {
      return (
        <div className="flex flex-col h-full bg-white">
          {/* Top Bar for Process View */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
             <div className="flex items-center gap-4">
               <button onClick={resetSession} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <div>
                 <h2 className="text-lg font-bold text-gray-900">New Transfer Application</h2>
                 <p className="text-xs text-gray-500">Session ID: {session.id.slice(0, 8)}</p>
               </div>
             </div>
             
             {session.status === 'review' && (
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 font-medium text-sm hover:bg-gray-50">
                    <Printer className="w-4 h-4" /> Print Form
                  </button>
                  <button 
                    onClick={resetSession}
                    className="flex items-center gap-2 px-4 py-2 bg-gov-blue text-white rounded-md font-medium text-sm hover:bg-blue-800 shadow-sm"
                  >
                    <Save className="w-4 h-4" /> Approve & Submit
                  </button>
                </div>
             )}
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left: Document Viewer */}
            <div className="w-1/2 p-6 bg-gray-100 border-r border-gray-200 flex flex-col">
               <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Source Document</h3>
               <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden relative">
                  {session.status === 'scanning' ? (
                    <Scanner onScanComplete={handleScan} isProcessing={false} />
                  ) : (
                    <>
                      <img src={session.imagePreviewUrl || ''} className="w-full h-full object-contain p-4" alt="Scanned Doc" />
                      {session.status === 'analyzing' && (
                         <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Scanner onScanComplete={() => {}} isProcessing={true} />
                         </div>
                      )}
                    </>
                  )}
               </div>
            </div>

            {/* Right: Data & Analysis */}
            <div className="w-1/2 p-6 bg-gray-50 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Processing Intelligence</h3>
              <div className="flex-1 overflow-hidden">
                {session.status === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <p className="font-bold">Error Processing Document</p>
                    <p className="text-sm">{error}</p>
                    <button onClick={() => setSession(prev => prev ? {...prev, status: 'scanning'} : null)} className="mt-2 text-sm underline">Try Again</button>
                  </div>
                )}
                
                {session.status === 'scanning' && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                     <div className="w-16 h-16 border-4 border-gray-200 border-t-gov-blue rounded-full animate-spin mb-4 opacity-0"></div>
                     <p>Waiting for document scan...</p>
                  </div>
                )}

                {session.status === 'analyzing' && (
                   <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                      <div className="w-12 h-12 border-4 border-gray-200 border-t-gov-blue rounded-full animate-spin"></div>
                      <div className="text-center">
                        <p className="font-semibold text-lg">Analyzing Document</p>
                        <p className="text-sm text-gray-500">Validating security features & calculating equivalency...</p>
                      </div>
                   </div>
                )}

                {session.status === 'review' && session.licenseData && session.equivalency && (
                  <AnalysisResult data={session.licenseData} equivalency={session.equivalency} />
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return <div className="p-8">View not implemented</div>;
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gov-dark flex flex-col text-white flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gov-blue rounded-md flex items-center justify-center font-bold">GS</div>
            <span className="font-bold text-lg tracking-tight">GovSync</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setCurrentView(AppView.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === AppView.DASHBOARD ? 'bg-gov-blue text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <History className="w-5 h-5" />
            <span className="font-medium">History</span>
          </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
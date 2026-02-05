'use client';

import { useState, useEffect, useCallback } from 'react';
import TxInputCard from '@/components/TxInputCard';
import ChainBadge from '@/components/ChainBadge';
import ExplorerLinks from '@/components/ExplorerLinks';
import HistoryList from '@/components/HistoryList';
import SampleHashes from '@/components/SampleHashes';
import ContaminationCard from '@/components/ContaminationCard';
import { detectChain, isValidTx, normalizeTx, ChainType } from '@/lib/tx';
import { getHistory, addToHistory, clearHistory, updateContaminationStatus } from '@/lib/storage';
import type { ContaminationStatus, ContaminationMatch } from '@/lib/types';

// Contamination check state type
type ContaminationState = ContaminationStatus | 'idle' | 'checking';

export default function Home() {
  // Current transaction being analyzed
  const [currentTx, setCurrentTx] = useState<string | null>(null);
  const [currentChain, setCurrentChain] = useState<ChainType | null>(null);
  
  // Validation error message
  const [error, setError] = useState<string | null>(null);
  
  // Contamination check state
  const [contaminationStatus, setContaminationStatus] = useState<ContaminationState>('idle');
  const [contaminationMatches, setContaminationMatches] = useState<ContaminationMatch[]>([]);
  const [contaminationError, setContaminationError] = useState<string | null>(null);
  
  // Transaction history from localStorage
  const [history, setHistory] = useState<string[]>([]);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Perform contamination check via API
  const checkContamination = useCallback(async (input: string) => {
    setContaminationStatus('checking');
    setContaminationMatches([]);
    setContaminationError(null);
    
    try {
      const response = await fetch('/api/contamination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check contamination');
      }
      
      const data = await response.json();
      const status = data.status as ContaminationStatus;
      
      setContaminationStatus(status);
      setContaminationMatches(data.matches || []);
      
      // Update storage with contamination status
      updateContaminationStatus(input, status);
      
    } catch (err) {
      console.error('Contamination check error:', err);
      setContaminationError(err instanceof Error ? err.message : 'Unknown error');
      setContaminationStatus('idle');
    }
  }, []);

  // Handle new transaction submission
  const handleSubmit = async (tx: string) => {
    setError(null);
    
    const normalized = normalizeTx(tx);
    
    // Validate the transaction hash or address
    if (!isValidTx(normalized)) {
      setError('Unable to detect chain. Please check your input format.');
      setCurrentTx(null);
      setCurrentChain(null);
      setContaminationStatus('idle');
      return;
    }
    
    // Detect the chain
    const chain = detectChain(normalized);
    setCurrentTx(normalized);
    setCurrentChain(chain);
    
    // Add to history
    addToHistory(normalized);
    setHistory(getHistory());
    
    // Run contamination check
    await checkContamination(normalized);
  };

  // Handle selecting a transaction from history
  const handleSelectFromHistory = async (tx: string) => {
    const chain = detectChain(tx);
    setCurrentTx(tx);
    setCurrentChain(chain);
    setError(null);
    
    // Move to top of history
    addToHistory(tx);
    setHistory(getHistory());
    
    // Run contamination check
    await checkContamination(tx);
  };

  // Handle clearing history
  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 animate-glow">
            <span className="text-3xl">🔮</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Tx Whisperer
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Paste any transaction hash and instantly detect which blockchain it belongs to.
            No RPC calls needed.
          </p>
        </header>

        {/* Main card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl">
          <TxInputCard onSubmit={handleSubmit} error={error} />
        </div>

        {/* Results section */}
        {currentTx && currentChain && currentChain !== 'unknown' && (
          <div className="animate-fade-in bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Chain detection result */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Detected Chain
              </h3>
              <div className="flex items-center gap-4">
                <ChainBadge chain={currentChain} />
                <span className="text-green-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Valid format
                </span>
              </div>
            </div>

            {/* Transaction hash display */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Input
              </h3>
              <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
                <code className="text-sm text-gray-300 font-mono break-all">
                  {currentTx}
                </code>
              </div>
            </div>

            {/* Explorer links */}
            <ExplorerLinks tx={currentTx} chain={currentChain} />
          </div>
        )}

        {/* Contamination Check Card */}
        <ContaminationCard 
          status={contaminationStatus}
          matches={contaminationMatches}
          error={contaminationError}
        />

        {/* Sample hashes section */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl">
          <SampleHashes onSelect={handleSubmit} />
        </div>

        {/* History section */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl">
          <HistoryList
            history={history}
            onSelect={handleSelectFromHistory}
            onClear={handleClearHistory}
          />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm">
          <p>
            Tx Whisperer detects chains using format heuristics only.
            <br />
            No network requests are made.
          </p>
        </footer>
      </div>
    </main>
  );
}

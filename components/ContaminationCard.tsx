'use client';

import type { ContaminationStatus, ContaminationMatch } from '@/lib/types';

/**
 * Props for ContaminationCard component
 */
interface ContaminationCardProps {
  /** Current status of the check */
  status: ContaminationStatus | 'idle' | 'checking';
  /** Matches found (if flagged) */
  matches?: ContaminationMatch[];
  /** Error message (if any) */
  error?: string | null;
}

/**
 * Spinner component for loading state
 */
function Spinner() {
  return (
    <svg 
      className="animate-spin h-5 w-5 text-primary-400" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Shield icon for the card header
 */
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

/**
 * Status indicator dot
 */
function StatusDot({ status }: { status: ContaminationCardProps['status'] }) {
  const colors = {
    idle: 'bg-gray-500',
    checking: 'bg-yellow-500 animate-pulse',
    clean: 'bg-green-500',
    flagged: 'bg-red-500 animate-pulse',
    unknown: 'bg-gray-500',
  };

  return (
    <span 
      className={`w-2.5 h-2.5 rounded-full ${colors[status]}`}
      aria-hidden="true"
    />
  );
}

/**
 * ContaminationCard displays the contamination check status
 * with states: idle, checking, clean, flagged, unknown
 */
export default function ContaminationCard({ status, matches = [], error }: ContaminationCardProps) {
  
  // Render content based on status
  const renderContent = () => {
    if (error) {
      return (
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            Error
          </span>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      );
    }

    switch (status) {
      case 'idle':
        return (
          <div className="font-mono text-sm text-gray-500 bg-gray-800/50 rounded-lg px-4 py-2.5 border border-gray-700/50">
            Ready for analysis...
          </div>
        );

      case 'checking':
        return (
          <div className="flex items-center gap-3 font-mono text-sm text-primary-400 bg-primary-500/10 rounded-lg px-4 py-2.5 border border-primary-500/30">
            <Spinner />
            <span>Analyzing...</span>
          </div>
        );

      case 'clean':
        return (
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No hits
            </span>
            <p className="text-xs text-gray-500">
              No matches found in demo blacklist
            </p>
          </div>
        );

      case 'flagged':
        return (
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Potential hit
            </span>
            
            {/* Match details */}
            {matches.length > 0 && (
              <div className="space-y-2">
                {matches.map((match, index) => (
                  <div 
                    key={index}
                    className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 space-y-1"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                        {match.entry.source}
                      </span>
                      <span className="text-sm text-gray-300">
                        {match.entry.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              Demo list only — not for compliance use
            </p>
          </div>
        );

      case 'unknown':
        return (
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
              Unknown format
            </span>
            <p className="text-xs text-gray-500">
              Could not identify input type
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldIcon className="w-5 h-5 text-red-400" />
          <h3 className="font-semibold text-white">Contamination Check</h3>
        </div>
        <StatusDot status={status} />
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-400">
        Scan addresses for illicit activity, sanctions list matches, or potential mixer involvement.
      </p>
      
      {/* Content */}
      {renderContent()}
    </div>
  );
}

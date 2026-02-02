'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface TxInputCardProps {
  onSubmit: (tx: string) => void;
  error: string | null;
}

/**
 * Input card for entering transaction hashes.
 * Includes a text area for pasting hashes and validation feedback.
 */
export default function TxInputCard({ onSubmit, error }: TxInputCardProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputValue(text);
    } catch (err) {
      // Clipboard API might not be available
      console.log('Could not read clipboard');
    }
  };

  const handleClear = () => {
    setInputValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={inputValue}
          onChange={handleChange}
          placeholder="Paste your transaction hash here..."
          className={`
            w-full h-28
            px-4 py-3
            bg-gray-900
            border-2 rounded-xl
            font-mono text-sm text-gray-100
            placeholder-gray-600
            resize-none
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950
            transition-all duration-200
            ${error 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' 
              : 'border-gray-700 focus:border-primary-500 focus:ring-primary-500/30'
            }
          `}
          spellCheck={false}
          autoComplete="off"
        />
        
        {/* Action buttons inside textarea */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={handlePaste}
            className="
              px-3 py-1.5
              text-xs font-medium
              text-gray-400 hover:text-white
              bg-gray-800 hover:bg-gray-700
              rounded-md
              transition-colors duration-200
            "
          >
            Paste
          </button>
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="
                px-3 py-1.5
                text-xs font-medium
                text-gray-400 hover:text-white
                bg-gray-800 hover:bg-gray-700
                rounded-md
                transition-colors duration-200
              "
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!inputValue.trim()}
        className={`
          w-full py-3
          font-semibold text-sm uppercase tracking-wide
          rounded-xl
          transition-all duration-200
          ${inputValue.trim()
            ? 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        Detect Chain
      </button>
    </form>
  );
}

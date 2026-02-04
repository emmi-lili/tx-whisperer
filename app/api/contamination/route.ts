/**
 * Contamination Check API Route
 * 
 * POST /api/contamination
 * Body: { input: string }
 * Returns: ContaminationResult
 * 
 * This is a mock API that checks against a local blacklist.
 * In production, this could integrate with external compliance services.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkContamination, getBlacklistInfo } from '@/lib/contamination';
import { detectChain, detectInputType, normalizeTx } from '@/lib/tx';
import type { ContaminationResult } from '@/lib/types';

/**
 * Request body structure
 */
interface ContaminationRequest {
  input: string;
}

/**
 * Extended response with additional metadata
 */
interface ContaminationResponse extends ContaminationResult {
  /** The normalized input that was checked */
  normalizedInput: string;
  /** Detected chain type */
  chain: string;
  /** Detected input type (address or tx) */
  inputType: string;
  /** Blacklist metadata */
  blacklistInfo: {
    version: string;
    lastUpdated: string;
    entryCount: number;
  };
  /** Disclaimer for demo purposes */
  disclaimer: string;
}

/**
 * POST handler for contamination check
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json() as ContaminationRequest;
    
    // Validate input
    if (!body.input || typeof body.input !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "input" field. Expected a string.' },
        { status: 400 }
      );
    }
    
    const input = body.input.trim();
    
    if (input.length === 0) {
      return NextResponse.json(
        { error: 'Input cannot be empty.' },
        { status: 400 }
      );
    }
    
    if (input.length > 200) {
      return NextResponse.json(
        { error: 'Input too long. Maximum 200 characters.' },
        { status: 400 }
      );
    }
    
    // Normalize and detect
    const normalizedInput = normalizeTx(input);
    const chain = detectChain(normalizedInput);
    const inputType = detectInputType(normalizedInput);
    
    // Perform contamination check
    const result = checkContamination(normalizedInput);
    
    // Build response
    const response: ContaminationResponse = {
      ...result,
      normalizedInput,
      chain,
      inputType,
      blacklistInfo: getBlacklistInfo(),
      disclaimer: 'This is a DEMO blacklist. Do not use for actual compliance decisions.',
    };
    
    // Simulate slight network delay for realistic UX (50-150ms)
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Contamination check error:', error);
    
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error during contamination check.' },
      { status: 500 }
    );
  }
}

/**
 * GET handler - returns API info
 */
export async function GET(): Promise<NextResponse> {
  const info = getBlacklistInfo();
  
  return NextResponse.json({
    name: 'Contamination Check API',
    version: '1.0.0',
    description: 'Check addresses and transactions against a demo blacklist',
    disclaimer: 'This is a DEMO blacklist. Do not use for actual compliance decisions.',
    blacklist: info,
    endpoints: {
      POST: {
        description: 'Check an input for contamination',
        body: { input: 'string (address or tx hash)' },
        response: 'ContaminationResponse',
      },
    },
  });
}

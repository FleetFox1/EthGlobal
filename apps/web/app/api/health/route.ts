import { NextResponse } from 'next/server';

/**
 * Diagnostic endpoint to check if dependencies are available
 * GET /api/health
 */
export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {} as Record<string, { available: boolean; error?: string }>,
  };

  // Check bls-eth-wasm
  try {
    require.resolve('bls-eth-wasm');
    diagnostics.checks['bls-eth-wasm'] = { available: true };
  } catch (error: any) {
    diagnostics.checks['bls-eth-wasm'] = { 
      available: false, 
      error: error.message 
    };
  }

  // Check Pinata (replaced Lighthouse)
  try {
    require.resolve('pinata');
    diagnostics.checks['pinata'] = { available: true };
  } catch (error: any) {
    diagnostics.checks['pinata'] = { 
      available: false, 
      error: error.message 
    };
  }

  // Check Privy
  try {
    require.resolve('@privy-io/react-auth');
    diagnostics.checks['@privy-io/react-auth'] = { available: true };
  } catch (error: any) {
    diagnostics.checks['@privy-io/react-auth'] = { 
      available: false, 
      error: error.message 
    };
  }

  // Check environment variables (without revealing values)
  diagnostics.checks['PINATA_JWT'] = { 
    available: !!process.env.PINATA_JWT 
  };
  diagnostics.checks['NEXT_PUBLIC_PRIVY_APP_ID'] = { 
    available: !!process.env.NEXT_PUBLIC_PRIVY_APP_ID 
  };
  diagnostics.checks['NEXT_PUBLIC_RPC_URL'] = { 
    available: !!process.env.NEXT_PUBLIC_RPC_URL 
  };
  diagnostics.checks['POSTGRES_URL'] = { 
    available: !!process.env.POSTGRES_URL 
  };

  const allAvailable = Object.values(diagnostics.checks)
    .every(check => check.available !== false);

  return NextResponse.json({
    status: allAvailable ? 'healthy' : 'degraded',
    ...diagnostics,
  });
}

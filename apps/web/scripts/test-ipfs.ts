/**
 * DEPRECATED: Test script for IPFS integration
 * This script was for Lighthouse SDK which has been replaced with Pinata
 * 
 * To test IPFS uploads now:
 * 1. Run the dev server: pnpm dev
 * 2. Use the upload-image API endpoint: POST /api/upload-image
 * 3. Or use the CameraModal component in the UI
 */

import { getIPFSUrl } from '../lib/pinata';

async function testIPFSIntegration() {
  console.log('⚠️  This script is deprecated.');
  console.log('📝 IPFS uploads now use Pinata SDK instead of Lighthouse.\n');
  console.log('✅ To test IPFS uploads:');
  console.log('   1. Run: pnpm dev');
  console.log('   2. Open: http://localhost:3000');
  console.log('   3. Connect wallet and upload a bug photo\n');
  console.log('📚 API endpoints using Pinata:');
  console.log('   - POST /api/upload-image');
  console.log('   - POST /api/upload-avatar');
  console.log('   - POST /api/upload-profile');
  console.log('   - POST /api/upload-metadata\n');
  
  // Example of utility function that still works
  const exampleCID = 'QmTest123...';
  console.log('🔗 Example IPFS URL:', getIPFSUrl(exampleCID));
}

testIPFSIntegration();

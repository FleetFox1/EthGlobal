/**
 * Quick test script for Lighthouse IPFS integration
 * Run with: npx tsx scripts/test-ipfs.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { uploadTextToIPFS, uploadBugMetadata, getIPFSUrl } from '../lib/lighthouse';

async function testIPFSIntegration() {
  console.log('🚀 Testing Lighthouse IPFS Integration...\n');

  try {
    // Test 1: Upload text
    console.log('📝 Test 1: Upload text to IPFS...');
    const textResult = await uploadTextToIPFS('Hello from BugDex! Testing IPFS upload.');
    console.log('✅ Text uploaded successfully!');
    console.log('   CID:', textResult.cid);
    console.log('   URL:', textResult.url, '\n');

    // Test 2: Upload bug metadata
    console.log('📦 Test 2: Upload bug metadata...');
    const metadataResult = await uploadBugMetadata({
      name: 'Test Bug #1',
      description: 'A test bug for IPFS integration',
      image: 'QmTest123...', // IPFS CID of the bug image
      rarity: '0', // Common
      discoverer: '0x1234567890abcdef1234567890abcdef12345678',
      location: 'Test Location',
      timestamp: Math.floor(Date.now() / 1000),
    });
    console.log('✅ Metadata uploaded successfully!');
    console.log('   CID:', metadataResult.cid);
    console.log('   URL:', metadataResult.url, '\n');

    console.log('🎉 All tests passed! IPFS integration is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('   1. Deploy smart contracts: cd apps/contracts && pnpm run node');
    console.log('   2. Get contract addresses and update .env.local');
    console.log('   3. Test submit-bug API: POST /api/submit-bug with multipart form data');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\n🔍 Troubleshooting:');
    console.error('   - Check if LIGHTHOUSE_API_KEY is set in .env.local');
    console.error('   - Verify API key is valid at https://lighthouse.storage/');
    console.error('   - Check internet connection');
    process.exit(1);
  }
}

testIPFSIntegration();

import { ethers } from 'hardhat';

async function main() {
  const profileRegistryAddress = '0xEa53a1898E8ad17e672b28BbB724CD7Ca56F1e60';
  
  // Your test wallet address
  const testWallet = '0x5B2102EABb473045b9644E254eE9819325b1067A';
  
  console.log('🔍 Checking profile for:', testWallet);
  console.log('📍 Registry contract:', profileRegistryAddress);
  
  const ProfileRegistry = await ethers.getContractAt('UserProfileRegistry', profileRegistryAddress);
  
  // Check if profile exists
  const hasProfile = await ProfileRegistry.hasProfile(testWallet);
  console.log('\n✅ Has profile:', hasProfile);
  
  if (hasProfile) {
    // Get the IPFS hash
    const ipfsHash = await ProfileRegistry.getProfile(testWallet);
    console.log('📦 IPFS Hash:', ipfsHash);
    
    // Get profile info
    const profileInfo = await ProfileRegistry.getProfileInfo(testWallet);
    console.log('📅 Last updated:', new Date(Number(profileInfo[1]) * 1000).toLocaleString());
    
    // Construct Lighthouse gateway URL
    const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${ipfsHash}`;
    console.log('🌐 Gateway URL:', gatewayUrl);
    console.log('\n💡 Visit the URL above to see your profile data!');
  } else {
    console.log('\n⚠️ No profile saved on-chain yet');
    console.log('💡 Visit /profile page and click "Save Profile" to create one');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

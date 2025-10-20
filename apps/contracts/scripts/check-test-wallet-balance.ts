import { ethers } from 'hardhat';

async function main() {
  const testWallet = '0x5B2102EABb473045b9644E254eE9819325b1067A';
  
  console.log('💰 Checking Sepolia ETH balance...\n');
  console.log('Test Wallet:', testWallet);
  
  const [signer] = await ethers.getSigners();
  const balance = await signer.provider.getBalance(testWallet);
  
  console.log('\n📊 Balance:');
  console.log('  Raw:', balance.toString(), 'wei');
  console.log('  ETH:', ethers.formatEther(balance), 'ETH');
  
  if (balance === 0n) {
    console.log('\n❌ Wallet has NO funds!');
    console.log('\n💡 Get Sepolia ETH from faucets:');
    console.log('   • https://sepoliafaucet.com');
    console.log('   • https://www.alchemy.com/faucets/ethereum-sepolia');
    console.log('   • https://cloud.google.com/application/web3/faucet/ethereum/sepolia');
  } else if (balance < ethers.parseEther('0.001')) {
    console.log('\n⚠️  Balance very low! Get more from faucet.');
  } else {
    console.log('\n✅ Wallet has sufficient funds');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

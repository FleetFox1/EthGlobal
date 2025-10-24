/**
 * Blockscout Explorer Integration
 * Custom explorer for BugDex contracts and transactions
 */

// Update this with your custom Blockscout URL once deployed
export const BLOCKSCOUT_BASE_URL = process.env.NEXT_PUBLIC_BLOCKSCOUT_URL || 'https://sepolia.etherscan.io';

/**
 * Generate Blockscout URL for transaction
 */
export function getTransactionUrl(txHash: string): string {
  return `${BLOCKSCOUT_BASE_URL}/tx/${txHash}`;
}

/**
 * Generate Blockscout URL for address
 */
export function getAddressUrl(address: string): string {
  return `${BLOCKSCOUT_BASE_URL}/address/${address}`;
}

/**
 * Generate Blockscout URL for token
 */
export function getTokenUrl(tokenAddress: string): string {
  return `${BLOCKSCOUT_BASE_URL}/token/${tokenAddress}`;
}

/**
 * Generate Blockscout URL for NFT
 */
export function getNFTUrl(contractAddress: string, tokenId: string): string {
  return `${BLOCKSCOUT_BASE_URL}/token/${contractAddress}/instance/${tokenId}`;
}

/**
 * Generate Blockscout URL for contract verification
 */
export function getContractUrl(address: string): string {
  return `${BLOCKSCOUT_BASE_URL}/address/${address}?tab=contract`;
}

/**
 * Component: Blockscout Link Button
 */
interface BlockscoutLinkProps {
  type: 'tx' | 'address' | 'token' | 'nft' | 'contract';
  value: string;
  tokenId?: string;
  children?: React.ReactNode;
  className?: string;
}

export function BlockscoutLink({ 
  type, 
  value, 
  tokenId, 
  children, 
  className = '' 
}: BlockscoutLinkProps) {
  let url = '';
  
  switch (type) {
    case 'tx':
      url = getTransactionUrl(value);
      break;
    case 'address':
      url = getAddressUrl(value);
      break;
    case 'token':
      url = getTokenUrl(value);
      break;
    case 'nft':
      url = getNFTUrl(value, tokenId || '0');
      break;
    case 'contract':
      url = getContractUrl(value);
      break;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline ${className}`}
    >
      {children || 'View on Explorer'}
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

/**
 * Short address display with Blockscout link
 */
export function AddressWithLink({ 
  address, 
  showFull = false 
}: { 
  address: string; 
  showFull?: boolean; 
}) {
  const display = showFull 
    ? address 
    : `${address.slice(0, 6)}...${address.slice(-4)}`;
    
  return (
    <BlockscoutLink type="address" value={address} className="font-mono">
      {display}
    </BlockscoutLink>
  );
}

/**
 * Transaction hash with Blockscout link
 */
export function TxHashWithLink({ 
  txHash, 
  showFull = false 
}: { 
  txHash: string; 
  showFull?: boolean; 
}) {
  const display = showFull 
    ? txHash 
    : `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
    
  return (
    <BlockscoutLink type="tx" value={txHash} className="font-mono">
      {display}
    </BlockscoutLink>
  );
}

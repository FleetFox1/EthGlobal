"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Wallet, Copy, CheckCircle, ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HelpPage() {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedNFT, setCopiedNFT] = useState(false);

  const BUG_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS || "0x5f7421B1e03D644CaFD3B13b2da2557748571a67";
  const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BUG_NFT_ADDRESS || "0xfDe4C483EbF1d187aB75C0AfCDa1342f273bE7DF";

  const copyToClipboard = (text: string, type: 'token' | 'nft') => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedNFT(true);
      setTimeout(() => setCopiedNFT(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Help & Setup Guide</h1>
            <p className="text-muted-foreground">
              Get started with BugDex tokens and NFTs
            </p>
          </div>
        </div>

        {/* Import BUG Token */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Wallet className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-xl font-bold mb-2">Import BUG Token to MetaMask</h2>
              <p className="text-sm text-muted-foreground">
                Add BUG tokens to your wallet to see your balance and use them for staking
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">BUG Token Contract Address:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background px-3 py-2 rounded text-xs font-mono break-all">
                  {BUG_TOKEN_ADDRESS}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(BUG_TOKEN_ADDRESS, 'token')}
                >
                  {copiedToken ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                How to Import in MetaMask:
              </p>
              <ol className="text-sm space-y-2 ml-6 list-decimal text-muted-foreground">
                <li>Open MetaMask and ensure you're on <strong>Sepolia testnet</strong></li>
                <li>Click <strong>"Tokens"</strong> tab at the bottom</li>
                <li>Click <strong>"Import tokens"</strong></li>
                <li>Paste the token address above</li>
                <li>MetaMask will auto-fill:
                  <ul className="list-disc ml-6 mt-1">
                    <li>Symbol: <strong>BUG</strong></li>
                    <li>Decimals: <strong>18</strong></li>
                  </ul>
                </li>
                <li>Click <strong>"Add Custom Token"</strong></li>
                <li>Click <strong>"Import Tokens"</strong></li>
                <li>✅ Done! You'll now see your BUG balance</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* Import BugNFT Collection */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Wallet className="h-6 w-6 text-purple-500 mt-1" />
            <div>
              <h2 className="text-xl font-bold mb-2">Import BugNFT Collection</h2>
              <p className="text-sm text-muted-foreground">
                Add the BugDex NFT collection to see your minted bugs in MetaMask
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">BugNFT Contract Address:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background px-3 py-2 rounded text-xs font-mono break-all">
                  {NFT_CONTRACT_ADDRESS}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(NFT_CONTRACT_ADDRESS, 'nft')}
                >
                  {copiedNFT ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                How to Import NFT Collection:
              </p>
              <ol className="text-sm space-y-2 ml-6 list-decimal text-muted-foreground">
                <li>Open MetaMask and go to <strong>"NFTs"</strong> tab</li>
                <li>Scroll down and click <strong>"Import NFT"</strong></li>
                <li>Paste the contract address above</li>
                <li>Enter your <strong>Token ID</strong> (shown after minting)</li>
                <li>Click <strong>"Add"</strong></li>
                <li>✅ Your Bug NFT will appear in your wallet!</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* Quick Start Guide */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">🚀 Quick Start Guide</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">Get Sepolia ETH</p>
                <p className="text-sm text-muted-foreground">
                  Visit <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">sepoliafaucet.com</a> to get free test ETH
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">Unlock Faucet ($1)</p>
                <p className="text-sm text-muted-foreground">
                  Pay ~$1 in ETH (dynamic price via Pyth oracle) or 1 PYUSD to unlock unlimited BUG token claims
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <p className="font-semibold">Import BUG Token</p>
                <p className="text-sm text-muted-foreground">
                  Follow the guide above to add BUG token to MetaMask - you'll see 100 BUG appear!
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <p className="font-semibold">Upload & Stake</p>
                <p className="text-sm text-muted-foreground">
                  Take a bug photo, stake 10 BUG to submit for community voting
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <p className="font-semibold">Earn & Mint</p>
                <p className="text-sm text-muted-foreground">
                  Get 5 BUG per upvote! If approved (2+ votes), mint your bug as an NFT
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Network Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">🌐 Network Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-semibold">Sepolia Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chain ID:</span>
              <span className="font-semibold">11155111</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">RPC URL:</span>
              <span className="font-mono text-xs">https://rpc.sepolia.org</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Explorer:</span>
              <a 
                href="https://bugdex-explorer.cloud.blockscout.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline flex items-center gap-1"
              >
                BugDex Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </Card>

        {/* Need Help? */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <h2 className="text-xl font-bold mb-2">💬 Need More Help?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            If you're having issues or need assistance, here are some resources:
          </p>
          <div className="space-y-2 text-sm">
            <p>• Check your wallet is on <strong>Sepolia testnet</strong></p>
            <p>• Make sure you have Sepolia ETH for gas fees</p>
            <p>• View all transactions on our <a href="https://bugdex-explorer.cloud.blockscout.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">custom explorer</a></p>
            <p>• Contract addresses are available in the sections above</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

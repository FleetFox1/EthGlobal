import { NextRequest, NextResponse } from "next/server";
import { getUserNFTs, getBugBalance } from "@/lib/contracts";
import { getIPFSUrl } from "@/lib/pinata";

/**
 * GET /api/user/[address]
 * 
 * Fetch user stats and collection
 * 
 * Route params:
 * - address: string - Wallet address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    // Validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    console.log("👤 Fetching user data for:", address);

    // Fetch user's NFT collection
    const nfts = await getUserNFTs(address);

    // Fetch BUG token balance
    const bugBalance = await getBugBalance(address);

    // Calculate stats
    const totalBugs = nfts.length;
    const rarityCount = nfts.reduce((acc, nft) => {
      acc[nft.rarity] = (acc[nft.rarity] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const totalVotes = nfts.reduce((sum, nft) => sum + nft.voteCount, 0);
    const verifiedCount = nfts.filter((nft) => nft.verified).length;

    // Enrich NFT data with URLs
    const enrichedNFTs = nfts.map((nft) => ({
      ...nft,
      metadataURL: getIPFSUrl(nft.ipfsHash),
      rarityName: [
        "Common",
        "Uncommon",
        "Rare",
        "Epic",
        "Legendary",
      ][nft.rarity],
    }));

    return NextResponse.json({
      success: true,
      data: {
        address,
        balance: {
          bug: bugBalance,
        },
        stats: {
          totalBugs,
          verifiedBugs: verifiedCount,
          totalVotesReceived: totalVotes,
          rarityBreakdown: {
            common: rarityCount[0] || 0,
            uncommon: rarityCount[1] || 0,
            rare: rarityCount[2] || 0,
            epic: rarityCount[3] || 0,
            legendary: rarityCount[4] || 0,
          },
        },
        collection: enrichedNFTs,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in user API:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch user data",
      },
      { status: 500 }
    );
  }
}

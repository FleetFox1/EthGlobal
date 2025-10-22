import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";
import { submitBugToVoting, BugRarity } from "@/lib/contracts";

/**
 * POST /api/submit-bug
 * 
 * Handles bug submission workflow:
 * 1. Upload image to IPFS (Lighthouse)
 * 2. Create and upload metadata JSON to IPFS
 * 3. Submit to voting contract
 * 
 * Request body (multipart/form-data):
 * - image: File (bug image)
 * - species: string (optional)
 * - location: string (optional)
 * - description: string (optional)
 * - rarity: number (0-4)
 * - userAddress: string (discoverer wallet address)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    
    const imageFile = formData.get("image") as File;
    const species = formData.get("species") as string || "Unknown Species";
    const location = formData.get("location") as string || "Unknown Location";
    const description = formData.get("description") as string || "A bug discovered in the wild";
    const rarity = parseInt(formData.get("rarity") as string) || BugRarity.COMMON;
    const userAddress = formData.get("userAddress") as string;

    // Validation
    if (!imageFile) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    if (!userAddress || !userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Valid wallet address is required" },
        { status: 400 }
      );
    }

    if (rarity < 0 || rarity > 4) {
      return NextResponse.json(
        { error: "Rarity must be between 0-4" },
        { status: 400 }
      );
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ error: 'Pinata JWT not configured' }, { status: 500 });
    }

    const pinata = new PinataSDK({ pinataJwt });

    console.log("📤 Starting bug submission process...");
    console.log("  User:", userAddress);
    console.log("  Species:", species);
    console.log("  Location:", location);
    console.log("  Rarity:", rarity);

    // Step 1: Upload image to IPFS via Pinata
    console.log("1️⃣  Uploading image to IPFS via Pinata...");
    const uploadResult = await pinata.upload.public.file(imageFile);
    const imageCID = uploadResult.cid;
    const imageURL = `https://gateway.pinata.cloud/ipfs/${imageCID}`;

    console.log("  ✅ Image CID:", imageCID);

    // Step 2: Create and upload metadata JSON
    console.log("2️⃣  Creating metadata JSON...");
    const nftMetadata = {
      name: `Bug #${Date.now()}`, // Temp name, will be updated after minting
      description: description,
      image: `ipfs://${imageCID}`,
      external_url: "https://bugdex.app",
      species: species,
      location: location,
      rarity: ["Common", "Uncommon", "Rare", "Epic", "Legendary"][rarity],
      discoverer: userAddress,
      timestamp: Date.now(),
      attributes: [
        { trait_type: "Species", value: species },
        { trait_type: "Location", value: location },
        { trait_type: "Rarity", value: ["Common", "Uncommon", "Rare", "Epic", "Legendary"][rarity] },
      ],
    };

    // Upload metadata to Pinata
    const metadataString = JSON.stringify(nftMetadata, null, 2);
    const metadataBlob = new Blob([metadataString], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'bug-metadata.json', { type: 'application/json' });
    const metadataUpload = await pinata.upload.public.file(metadataFile);
    const metadataCID = metadataUpload.cid;
    const metadataURL = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;
    console.log("  ✅ Metadata CID:", metadataCID);

    // Step 3: Submit to voting contract
    console.log("3️⃣  Submitting to voting contract...");
    const { submissionId, txHash } = await submitBugToVoting(metadataCID, rarity);
    console.log("  ✅ Submission ID:", submissionId);
    console.log("  ✅ Transaction:", txHash);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Bug submitted successfully for voting",
      data: {
        submissionId,
        imageCID,
        imageURL,
        metadataCID,
        metadataURL,
        txHash,
        votingDeadline: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days
      },
    });
  } catch (error: any) {
    console.error("❌ Error in submit-bug API:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit bug",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/submit-bug
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/submit-bug",
    method: "POST",
    description: "Submit a bug for community voting",
    requestBody: {
      type: "multipart/form-data",
      fields: {
        image: "File - Bug image (required)",
        species: "string - Bug species (optional)",
        location: "string - Discovery location (optional)",
        description: "string - Bug description (optional)",
        rarity: "number - Rarity level 0-4 (required)",
        userAddress: "string - Wallet address (required)",
      },
    },
    response: {
      success: "boolean",
      data: {
        submissionId: "number - Voting submission ID",
        imageCID: "string - IPFS CID of image",
        imageURL: "string - Gateway URL for image",
        metadataCID: "string - IPFS CID of metadata",
        metadataURL: "string - Gateway URL for metadata",
        txHash: "string - Transaction hash",
        votingDeadline: "number - Timestamp when voting ends",
      },
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

// Proper ABIs for BugVotingV2 contract methods
const CONTRACT_ABIS: Record<string, {
  inputs: Array<{ name: string; type: string }>;
  name: string;
  outputs: Array<{ name: string; type: string }>;
  stateMutability: string;
  type: string;
}> = {
  submissions: {
    inputs: [{ name: "id", type: "uint256" }],
    name: "submissions",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "submitter", type: "address" },
      { name: "ipfsHash", type: "string" },
      { name: "createdAt", type: "uint256" },
      { name: "votesFor", type: "uint256" },
      { name: "votesAgainst", type: "uint256" },
      { name: "resolved", type: "bool" },
      { name: "approved", type: "bool" },
      { name: "nftClaimed", type: "bool" },
      { name: "nftTokenId", type: "uint256" },
      { name: "rarity", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  hasVoted: {
    inputs: [
      { name: "submissionId", type: "uint256" },
      { name: "voter", type: "address" },
    ],
    name: "hasVoted",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  submissionCount: {
    inputs: [],
    name: "submissionCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  getSubmissionsBySubmitter: {
    inputs: [{ name: "submitter", type: "address" }],
    name: "getSubmissionsBySubmitter",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");
    const method = searchParams.get("method");
    const argsString = searchParams.get("args");

    if (!address || !method) {
      return NextResponse.json(
        { error: "Missing address or method" },
        { status: 400 }
      );
    }

    const abiDef = CONTRACT_ABIS[method];
    if (!abiDef) {
      return NextResponse.json(
        { error: `Unknown method: ${method}` },
        { status: 400 }
      );
    }

    // Parse arguments based on ABI inputs
    const args = argsString
      ? argsString.split(",").map((arg, index) => {
          const inputType = abiDef.inputs[index]?.type;
          
          // Handle addresses
          if (inputType === "address") {
            return arg.trim() as `0x${string}`;
          }
          // Handle uint256 and other numbers
          if (inputType?.startsWith("uint") || inputType?.startsWith("int")) {
            return BigInt(arg.trim());
          }
          // Handle booleans
          if (inputType === "bool") {
            return arg.trim() === "true";
          }
          return arg.trim();
        })
      : [];

    // Read from contract
    const result = await client.readContract({
      address: address as `0x${string}`,
      abi: [abiDef],
      functionName: method,
      args: args as readonly unknown[],
    });

    // Convert BigInt values to strings for JSON serialization
    const serializedResult = JSON.parse(
      JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json({ result: serializedResult });
  } catch (error) {
    const err = error as Error;
    console.error("Contract read error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to read contract" },
      { status: 500 }
    );
  }
}

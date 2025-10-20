import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

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

    // Parse arguments
    const args = argsString ? argsString.split(",").map((arg) => {
      // Handle addresses
      if (arg.startsWith("0x") && arg.length === 42) {
        return arg;
      }
      // Handle numbers
      if (!isNaN(Number(arg))) {
        return BigInt(arg);
      }
      return arg;
    }) : [];

    // Read from contract
    const result = await client.readContract({
      address: address as `0x${string}`,
      abi: [{
        name: method,
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "tuple" }],
      }] as any,
      functionName: method,
      args: args as any,
    });

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Contract read error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to read contract" },
      { status: 500 }
    );
  }
}

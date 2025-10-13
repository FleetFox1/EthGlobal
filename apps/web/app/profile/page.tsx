"use client";
import { useUser } from "@/lib/useUser";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfilePage() {
  const { profile, loading, isAuthenticated } = useUser();
  
  if (loading) return <div className="p-8">Loading...</div>;
  if (!isAuthenticated) return <div className="p-8">Please connect wallet</div>;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {profile && (
        <div className="space-y-2">
          <p>Username: {profile.username}</p>
          <p>Address: {profile.address}</p>
          <p>Member since: {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      )}
      <Link href="/"><Button className="mt-4">Home</Button></Link>
    </div>
  );
}

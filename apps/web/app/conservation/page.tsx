"use client";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Heart, ExternalLink, Bug, Globe, Shield, Users } from 'lucide-react';
import Link from 'next/link';

const conservationOrgs = [
  {
    name: "The Xerces Society",
    description: "International nonprofit organization that protects wildlife through the conservation of invertebrates and their habitats.",
    website: "https://www.xerces.org",
    logo: "🦋",
    mission: "Pollinator & invertebrate conservation",
    impact: "Protected 2.5M acres of habitat",
  },
  {
    name: "Buglife",
    description: "The only organization in Europe devoted to the conservation of all invertebrates, working to save Britain's rarest bugs.",
    website: "https://www.buglife.org.uk",
    logo: "🐞",
    mission: "UK invertebrate conservation",
    impact: "Created 1,200+ B-Lines wildlife corridors",
  },
  {
    name: "Butterfly Conservation",
    description: "Saving butterflies, moths and our environment. The leading charity fighting to save butterflies, moths and their habitats.",
    website: "https://butterfly-conservation.org",
    logo: "🦋",
    mission: "Butterfly & moth conservation",
    impact: "Monitoring 2,500+ sites across UK",
  },
  {
    name: "Pollinator Partnership",
    description: "The largest organization dedicated exclusively to the protection and promotion of pollinators and their ecosystems.",
    website: "https://www.pollinator.org",
    logo: "🐝",
    mission: "North American pollinator protection",
    impact: "1M+ acres of pollinator habitat",
  },
];

const stats = [
  {
    icon: Bug,
    value: "40%",
    label: "Insect species at risk of extinction",
    color: "text-red-500",
  },
  {
    icon: Globe,
    value: "80%",
    label: "Of plants depend on insect pollination",
    color: "text-green-500",
  },
  {
    icon: Shield,
    value: "$577B",
    label: "Annual value of pollinator services",
    color: "text-blue-500",
  },
  {
    icon: Users,
    value: "1M+",
    label: "Known insect species",
    color: "text-purple-500",
  },
];

export default function ConservationPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Bug Conservation</h1>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Help Save Our Bugs
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Insects are essential to our ecosystem, but they&apos;re disappearing at an alarming rate.
              By using BugDex, you&apos;re contributing to conservation efforts worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-y border-gray-800 bg-gray-950/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center space-y-3">
                  <Icon className={`w-8 h-8 mx-auto ${stat.color}`} />
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How BugDex Helps */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-center">How BugDex Supports Conservation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-gray-900 border-gray-800 p-6 text-center space-y-3">
              <div className="text-4xl">💰</div>
              <h4 className="text-lg font-semibold">Funding Conservation</h4>
              <p className="text-sm text-gray-400">
                A portion of platform unlock fees supports conservation organizations and bug research initiatives
              </p>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-6 text-center space-y-3">
              <div className="text-4xl">📊</div>
              <h4 className="text-lg font-semibold">Citizen Science</h4>
              <p className="text-sm text-gray-400">
                Your bug discoveries contribute to biodiversity research and monitoring
              </p>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-6 text-center space-y-3">
              <div className="text-4xl">🌍</div>
              <h4 className="text-lg font-semibold">Awareness</h4>
              <p className="text-sm text-gray-400">
                Every submission raises awareness about insect diversity and importance
              </p>
            </Card>
          </div>

          {/* Where Your Money Goes */}
          <div className="mb-16 bg-gradient-to-br from-green-500/5 to-blue-500/5 border border-green-500/20 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-center">Where Your $1 Goes</h3>
            <p className="text-gray-400 text-center mb-6 max-w-2xl mx-auto">
              When you unlock the BugDex faucet for $1, here&apos;s how those funds are used:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⛽</div>
                <div>
                  <h4 className="font-semibold mb-1">Gas Pool (Majority)</h4>
                  <p className="text-sm text-gray-400">
                    Funds gasless transactions so you can submit bugs, vote, and mint NFTs without paying gas fees
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🌿</div>
                <div>
                  <h4 className="font-semibold mb-1">Conservation (Portion)</h4>
                  <p className="text-sm text-gray-400">
                    A portion supports bug conservation organizations and citizen science research initiatives
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Organizations */}
          <h3 className="text-3xl font-bold mb-8 text-center">Conservation Partners</h3>
          <p className="text-center text-gray-400 mb-8">
            Organizations we plan to support as the platform grows
          </p>

          <div className="space-y-6">
            {conservationOrgs.map((org, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800 p-6">
                <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  <div className="text-6xl">{org.logo}</div>
                  
                  <div className="flex-1 space-y-3">
                    <h4 className="text-2xl font-bold text-white">{org.name}</h4>
                    <p className="text-gray-300">{org.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Mission:</span>{' '}
                        <span className="text-gray-300">{org.mission}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Impact:</span>{' '}
                        <span className="text-gray-300">{org.impact}</span>
                      </div>
                    </div>

                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center space-y-6">
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Start Making a Difference Today</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Every bug you discover, every vote you cast, and every token you earn helps support 
                these incredible organizations in their mission to protect our planet&apos;s smallest heroes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/donate">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90">
                    <Heart className="w-5 h-5 mr-2" fill="currentColor" />
                    Donate to Conservation
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="border-gray-700">
                    Start Discovering Bugs
                  </Button>
                </Link>
                <Link href="/voting">
                  <Button variant="outline" className="border-gray-700">
                    View Active Submissions
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              BugDex is committed to transparency. Conservation contribution reports will be published quarterly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

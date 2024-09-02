"use client";

import { useState } from "react";
import { TokenCard } from "@/components/token-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Home() {
  const numberOfTokenCards = 12;
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto px-8 py-16">
      <div className="mb-12 max-w-3xl mx-auto">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 pr-4 py-6 text-lg rounded-full shadow-lg"
          />
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-center">
          Latest Tokens
        </h1>
        <p className="mt-4 text-center">
          Explore the latest tokens deployed with our Factory.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-10 justify-items-center">
        {[...Array(numberOfTokenCards)].map((_, index) => (
          <div key={index} className="w-full max-w-lg">
            <TokenCard />
          </div>
        ))}
      </div>
    </div>
  );
}

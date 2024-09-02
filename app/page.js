import { TokenCard } from "@/components/token-card";

export default function Home() {
  const numberOfTokenCards = 12;

  return (
    <div className="container mx-auto px-8 py-16">
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

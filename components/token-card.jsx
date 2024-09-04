import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Image from "next/image"; // For optimized image loading with Next.js

export function TokenCard({
  tokenAddress,
  name,
  symbol,
  description,
  imageUrl,
  twitterLink,
  telegramLink,
  websiteLink,
}) {
  // Format the token address for display (e.g., "0x1234...5678")
  const formattedAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(
    -4
  )}`;

  // Use a default placeholder image if the image URL is not available
  const displayedImageUrl = imageUrl || "/placeholder.svg";

  return (
    <Card className="bg-background rounded-xl overflow-hidden shadow-lg w-full max-w-lg">
      <Link href={`/${tokenAddress}`} prefetch={false}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <Image
              src={displayedImageUrl} // Use provided image or fallback
              alt="Token Logo"
              className="w-[70px] h-[70px] rounded-full"
              width="70"
              height="70"
              style={{ objectFit: "cover" }}
            />
            <div className="overflow-hidden">
              {/* Token Name */}
              <h3 className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-300">
                {name}
              </h3>
              {/* Token Symbol */}
              <p className="text-sm text-muted-foreground">{symbol}</p>
            </div>
          </div>
        </div>
        <div className="p-6 h-24 overflow-y-auto scrollbar-hide">
          <p className="text-muted-foreground">
            {/* Use the provided description or a default message */}
            {description
              ? description
              : `This is a decentralized token named ${name} with the symbol ${symbol}.`}
          </p>
        </div>
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            {/* Display the icons only if links are provided */}
            {twitterLink && (
              <Link
                href={twitterLink}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
              >
                <TwitterIcon className="w-5 h-5" />
              </Link>
            )}
            {telegramLink && (
              <Link
                href={telegramLink}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
              >
                <TextIcon className="w-5 h-5" />
              </Link>
            )}
            {websiteLink && (
              <Link
                href={websiteLink}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
              >
                <GlobeIcon className="w-5 h-5" />
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Display the token address */}
            <Link
              className="text-sm text-muted-foreground cursor-pointer hover:underline"
              href={`https://basescan.org/address//${tokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
            >
              {formattedAddress}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(tokenAddress);
                toast("Token address copied to clipboard!");
              }}
            >
              <CopyIcon className="w-5 h-5" />
              <span className="sr-only">Copy token address</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CopyIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function GlobeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function TextIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 6.1H3" />
      <path d="M21 12.1H3" />
      <path d="M15.1 18H3" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

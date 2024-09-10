import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Image from "next/image"; // For optimized image loading with Next.js
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import { Label } from "./ui/label";

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

  const displayedImageUrl =
    `https://gateway.pinata.cloud/ipfs/${imageUrl}` ||
    "https://gateway.pinata.cloud/ipfs/Qme2CbcqAQ2kob78MLFWve7inyaKq5tPDU2LKqBnC1W6Fo";

  return (
    <Card className="bg-background rounded-xl overflow-hidden shadow-lg w-full max-w-lg">
      <Link href={`/${tokenAddress}`} prefetch={false}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <Image
              src={displayedImageUrl} // Use provided image or fallback
              alt="Token Logo"
              className="w-[80px] h-[80px] rounded-full"
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
          {/* <div className="text-md opacity-60 text-muted-foreground mt-2">
            - MCAP
          </div> */}
        </div>
        <div className="p-6 h-16 overflow-auto scrollbar-hide">
          <p className="text-muted-foreground break-words">
            {description
              ? description
              : `This is a decentralized token named ${name} with the symbol ${symbol}.`}
          </p>
        </div>
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
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
            {twitterLink && (
              <Link
                href={twitterLink}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
              >
                <FaXTwitter className="w-5 h-5" />
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
                <FaTelegramPlane className="w-5 h-5" />
              </Link>
            )}
            {!websiteLink && !twitterLink && !telegramLink && (
              <Label className="opacity-50">No social links</Label>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="text-sm text-muted-foreground cursor-pointer !text-blue-500 hover:underline"
              href={`https://etherscan.io/address/${tokenAddress}`}
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
              <CopyIcon className="w-5 h-5 !text-blue-500" />
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

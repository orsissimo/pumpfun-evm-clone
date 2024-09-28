import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Image from "next/image"; // For optimized image loading with Next.js
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";

export function TokenCard({
  tokenAddress,
  name,
  symbol,
  description,
  imageUrl,
  twitterLink,
  telegramLink,
  websiteLink,
  tokenFactory,
  chain,
}) {
  const router = useRouter();

  /* const chain =
    tokenFactory === process.env.NEXT_PUBLIC_FACTORY_ETH ? "ethereum" : "base"; */

  // Format the token address for display (e.g., "0x1234...5678")
  const formattedAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(
    -4
  )}`;

  const displayedImageUrl =
    `https://gateway.pinata.cloud/ipfs/${imageUrl}` ||
    "https://gateway.pinata.cloud/ipfs/Qme2CbcqAQ2kob78MLFWve7inyaKq5tPDU2LKqBnC1W6Fo";

  const handleCardClick = (e) => {
    // Check if the click target is not one of the interactive elements
    if (!e.defaultPrevented && !e.target.closest("a, button")) {
      router.push(`/${chain}/${tokenAddress}`);
    }
  };

  const explorerUrl =
    chain === "ethereum"
      ? `https://etherscan.io/address/${tokenAddress}`
      : `https://basescan.org/address/${tokenAddress}`;

  return (
    <Card
      className="relative rounded-xl overflow-hidden shadow-lg w-full max-w-3xl cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Top-right icon */}
      <div className="absolute top-4 right-4">
        <Image
          src={chain === "ethereum" ? "/ethereum.png" : "/base.png"}
          alt={`${chain} icon`}
          priority={true}
          width={28}
          height={28}
        />
      </div>

      <div className="flex p-4 md:p-5">
        {/* Left Column - Image */}
        <div className="flex-shrink-0 mr-6 overflow-hidden rounded-xl">
          <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] relative">
            <Image
              src={displayedImageUrl}
              alt={`${name} Logo`}
              priority={true}
              fill
              sizes="(max-width: 768px) 100px, 120px"
              style={{ objectFit: "cover" }}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Right Column - Text content */}
        <div className="flex-grow flex flex-col min-w-0">
          <h1 className="text-md md:text-xl font-bold truncate w-20 2xl:w-36">
            {name}
          </h1>
          <div className=" text-sm md:text-lg font-bold text-muted-foreground whitespace-nowrap">
            [ ${symbol} ]
          </div>

          <div className="flex items-center gap-2">
            <Link
              className="text-xs text-blue-500 hover:underline truncate"
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              onClick={(e) => e.stopPropagation()}
            >
              {formattedAddress}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(tokenAddress);
                toast("Token address copied to clipboard");
              }}
            >
              <CopyIcon className="w-4 h-4 text-blue-500" />
              <span className="sr-only">Copy token address</span>
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-auto">
            {websiteLink && (
              <Link
                href={websiteLink}
                className="text-primary hover:text-blue-500 transition"
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
                onClick={(e) => e.stopPropagation()}
              >
                <GlobeIcon className="h-4 w-4" />
              </Link>
            )}
            {twitterLink && (
              <Link
                href={twitterLink}
                className="text-primary hover:text-blue-500 transition"
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
                onClick={(e) => e.stopPropagation()}
              >
                <FaXTwitter className="h-4 w-4" />
              </Link>
            )}
            {telegramLink && (
              <Link
                href={telegramLink}
                className="text-primary hover:text-blue-500 transition"
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
                onClick={(e) => e.stopPropagation()}
              >
                <FaTelegramPlane className="h-4 w-4" />
              </Link>
            )}
            {!websiteLink && !twitterLink && !telegramLink && (
              <Label className="text-muted-foreground">No social links</Label>
            )}
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

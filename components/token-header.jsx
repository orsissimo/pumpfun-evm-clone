// TokenHeader.js
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyIcon, GlobeIcon } from "./ui/utils";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import { toast } from "react-toastify";

export function TokenHeader({
  name,
  symbol,
  description,
  displayedImageUrl,
  twitterLink,
  telegramLink,
  websiteLink,
  tokenAddress,
}) {
  const formattedAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(
    -4
  )}`;

  return (
    <div className="flex flex-col md:flex-row w-full max-w-3xl mx-auto gap-6 p-4 md:p-0">
      {/* Left Column - Image */}
      <div className="flex-shrink-0 w-full md:w-auto">
        <Image
          src={displayedImageUrl}
          width={180}
          height={180}
          alt={`${name} Logo`}
          className="rounded-3xl w-full md:w-[180px] h-auto md:h-[180px] object-contain"
        />
      </div>

      {/* Right Column - Text content */}
      <div className="flex-grow flex flex-col min-w-0 space-y-4 md:space-y-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold truncate">{name}</h1>
            <div className="text-2xl font-bold text-muted-foreground">
              [ ${symbol} ]
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              className="text-sm text-blue-500 hover:underline truncate"
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
                toast("Token address copied to clipboard");
              }}
            >
              <CopyIcon className="w-5 h-5 text-blue-500" />
              <span className="sr-only">Copy token address</span>
            </Button>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-2 break-words overflow-y-auto max-h-24 md:h-24 scrollbar-hide">
            {description ||
              `${name} is a decentralized cryptocurrency that powers an ecosystem.`}
          </p>
        </div>

        <div className="flex items-center gap-4 mt-auto">
          {websiteLink && (
            <Link
              href={websiteLink}
              className="text-muted-foreground hover:text-blue-500 transition"
              prefetch={false}
            >
              <GlobeIcon className="h-5 w-5" />
            </Link>
          )}
          {twitterLink && (
            <Link
              href={twitterLink}
              className="text-muted-foreground hover:text-blue-500 transition"
              prefetch={false}
            >
              <FaXTwitter className="h-5 w-5" />
            </Link>
          )}
          {telegramLink && (
            <Link
              href={telegramLink}
              className="text-muted-foreground hover:text-blue-500 transition"
              prefetch={false}
            >
              <FaTelegramPlane className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

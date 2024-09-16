import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Image from "next/image";
import { FaTelegramPlane } from "react-icons/fa";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import {
  FaXTwitter,
  FaWandMagicSparkles,
  FaHatWizard,
  FaChartSimple,
} from "react-icons/fa6";
import { GiMagicLamp, GiMagicHat, GiBoltSpellCast } from "react-icons/gi";

export function Hero({
  tokenAddress,
  name,
  symbol,
  description,
  imageUrl,
  twitterLink,
  telegramLink,
  websiteLink,
}) {
  const router = useRouter();
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
      router.push(`/${tokenAddress}`);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center bg-background p-4 gap-8">
      {/* Left Column - Main Card */}
      <Card
        className="hidden md:block rounded-xl overflow-hidden shadow-lg lg:w-2/5 cursor-pointer border-opacity-40"
        onClick={handleCardClick}
      >
        <div className="flex flex-col md:flex-row p-6 md:p-8">
          {/* Left Column - Image */}
          <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
            <div className="w-[180px] h-[180px] md:w-[230px] md:h-[230px] relative mx-auto md:mx-0">
              <Image
                src={displayedImageUrl}
                alt={`${name} Logo`}
                layout="fill"
                objectFit="cover"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Right Column - Text content */}
          <div className="flex-grow flex flex-col min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
            <div className="text-xl md:text-2xl font-bold text-muted-foreground">
              [ ${symbol} ]
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Link
                className="text-sm md:text-base text-blue-500 hover:underline"
                href={`https://etherscan.io/address/${tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
                onClick={(e) => e.stopPropagation()}
              >
                {formattedAddress}
              </Link>
              <Button
                variant="ghost"
                size="sm"
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

            <div className="hidden md:block text-sm md:text-md text-muted-foreground overflow-y-auto h-16 scrollbar-hide">
              {description}
            </div>

            <div className="flex items-center gap-6 mt-auto">
              {websiteLink && (
                <Link
                  href={websiteLink}
                  className="text-primary hover:text-blue-500 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                  prefetch={false}
                  onClick={(e) => e.stopPropagation()}
                >
                  <GlobeIcon className="h-4 w-4 md:h-6 md:w-6" />
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
                  <FaXTwitter className="h-4 w-4 md:h-6 md:w-6" />
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
                  <FaTelegramPlane className="h-4 w-4 md:h-6 md:w-6" />
                </Link>
              )}
              {!websiteLink && !twitterLink && !telegramLink && (
                <Label className="text-muted-foreground text-sm md:text-md">
                  No social links
                </Label>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Right Column - Two Smaller Cards */}
      <div className="w-full lg:w-1/4 flex flex-col gap-4">
        {/* Upper Card */}
        <Card className="bg-background rounded-xl overflow-hidden shadow-lg w-full p-6">
          <h2 className="text-xl font-bold mb-4">Token Deployer</h2>
          <Link href="/create">
            <Button className="w-full h-auto text-lg" variant="outline">
              <GiMagicHat className="mr-2 h-6 w-6" />
              Create
            </Button>
          </Link>
        </Card>

        {/* Lower Card */}
        <Card className="bg-background rounded-xl overflow-hidden shadow-lg w-full p-6">
          <h2 className="text-xl font-bold mb-4">Pump Stats</h2>
          <Button className="w-full h-auto text-lg" variant="outline">
            <FaChartSimple className="mr-2 h-6 w-6" />
            Soon
          </Button>
        </Card>
      </div>
    </div>
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

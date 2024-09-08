"use client";

/* eslint-disable react/no-unescaped-entities */

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoExitOutline } from "react-icons/io5";
import Image from "next/image";
import { FeeTable } from "./fee-table";
import { FaWandMagicSparkles, FaHatWizard } from "react-icons/fa6";
import { GiMagicLamp, GiMagicHat, GiBoltSpellCast } from "react-icons/gi";
import { IoExit } from "react-icons/io5";
import { LuLink } from "react-icons/lu";
import { GiVortex } from "react-icons/gi";

export function Docs() {
  const [currentSection, setCurrentSection] = useState("Introduction");
  const [isOpen, setIsOpen] = useState(false);

  // Sidebar section configuration
  const sections = [
    {
      name: "Introduction",
      icon: (props) => <FaHatWizard className="w-6 h-6" />,
    },
    {
      name: "How it works",
      icon: (props) => <FaWandMagicSparkles className="w-6 h-6" />,
    },
    {
      name: "How to create a token",
      icon: (props) => <GiMagicHat className="w-6 h-6" />,
    },
    {
      name: "How to Buy/Sell",
      icon: (props) => <GiBoltSpellCast className="w-6 h-6" />,
    },
    {
      name: "Service fee",
      icon: (props) => <GiVortex className="w-6 h-6 rounded-full" />,
    },
    { name: "Links", icon: (props) => <LuLink className="w-6 h-6" /> },
    { name: "Support", icon: (props) => <GiMagicLamp className="w-6 h-6" /> },
    {
      name: "Home",
      icon: (props) => <IoExitOutline className="w-6 h-6" />,
      path: "/",
    },
  ];

  // Function to render content dynamically
  const renderContent = () => {
    switch (currentSection) {
      case "Introduction":
        return <Introduction />;
      case "How it works":
        return <HowItWorks />;
      case "How to create a token":
        return <HowToCreate />;
      case "How to Buy/Sell":
        return <HowToBuy />;
      case "Service fee":
        return <ServiceFee />;
      case "Links":
        return <Links />;
      case "Support":
        return <Support />;
      default:
        return <div>Section not found.</div>;
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-10 flex w-64 flex-col border-r bg-background p-4 transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 sm:flex`}
      >
        <div className="mb-6 flex items-center gap-2">
          <BookIcon className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Documentation</h1>
        </div>
        <nav className="flex flex-col gap-2">
          {sections.map(({ name, icon: Icon, path }, index) => (
            <Link
              key={index}
              href={path || "#"} // Use path if defined, otherwise "#"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
              onClick={() => (path ? null : setCurrentSection(name))} // Only set section if no path
            >
              <Icon className="h-4 w-4" />
              {name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 sm:pl-64">
        <div className="mx-auto max-w-3xl">{renderContent()}</div>
      </div>

      {/* Button to toggle the sidebar */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-20 sm:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <VolumeXIcon className="h-6 w-6" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    </div>
  );
}

function Introduction(props) {
  return (
    <div className="flex flex-col items-start justify-center bg-background text-foreground">
      <div className="max-w-3xl space-y-6 text-left">
        <Image
          src="/placeholder.svg"
          alt="How it works"
          width={1200}
          height={400}
          className="mx-auto w-full max-w-3xl rounded-lg object-cover"
          style={{ aspectRatio: "1200/400", objectFit: "cover" }}
        />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          What is pump.style?
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl">
          Pump.style is a cutting-edge launchpad that empowers users to create
          tokens effortlessly within seconds, without any technical expertise or
          the need to provide liquidity.
        </p>
        <p className="text-muted-foreground text-lg md:text-xl">
          Tokens are generated free of charge (aside from gas fees) and are
          instantly tradable on the platform, offering a seamless experience for
          anyone looking to launch their own digital asset.
        </p>
      </div>
    </div>
  );
}

function HowItWorks(props) {
  return (
    <div className="flex flex-col items-start justify-center bg-background text-foreground">
      <div className="max-w-3xl space-y-6 text-left">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          How it works?
        </h1>
        <Image
          src="/placeholder.svg"
          alt="How it works"
          width={1200}
          height={400}
          className="mx-auto w-full max-w-3xl rounded-lg object-cover"
          style={{ aspectRatio: "1200/400", objectFit: "cover" }}
        />
        <p className="text-muted-foreground text-lg md:text-xl">
          Pump.style utilizes a virtual liquidity model based on a bonding
          curve, where liquidity is generated by investor participation through
          token buys and sells.
        </p>
        <p className="text-muted-foreground text-lg md:text-xl">
          At launch, the initial virtual liquidity is 1ETH and tokens typically
          have an initial market cap between $2,500 and $3,000, depending on the
          current price of ETH.
        </p>
        <p className="text-muted-foreground text-lg md:text-xl">
          Once the token's market cap reaches approximately $50,000 (with slight
          variations based on ETH price fluctuations), it is automatically
          listed on Uniswap with 4ETH in liquidity. In the same transaction, the
          liquidity pool (LP) is burned, and the Smart Contract is renounced,
          ensuring transparency and decentralization. Following this, the token
          becomes visible to trading bots for users who employ them.
        </p>
      </div>
    </div>
  );
}

function HowToCreate(props) {
  return (
    <div className="flex flex-col items-start justify-center bg-background text-foreground">
      <div className="max-w-3xl space-y-6 text-left">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          How to create a token?
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl">
          Creating your own tokens on pump.style is a quick and simple process:
        </p>
        <ol className="space-y-4 text-lg md:text-xl list-decimal pl-5">
          <li>
            Connect your wallet to the platform and ensure you have ETH on the
            ETH Mainnet.
          </li>
          <li>
            Navigate to the "Token Deployer" section and fill in the necessary
            details for your token. Supported image formats include jpg, gif
            (512KB max), png and jpeg. If your logo upload fails, contact
            support to manually add it.
          </li>
          <li>
            Click "Deploy" to launch your token. As the creator, you have the
            option to purchase your own tokens first, though it's not required.
          </li>
          <li>
            Confirm the transaction in your wallet, and your token is live!
          </li>
        </ol>
        <Image
          src="/placeholder.svg"
          alt="How it works"
          width={1200}
          height={400}
          className="mx-auto w-full max-w-3xl rounded-lg object-cover"
          style={{ aspectRatio: "1200/400", objectFit: "cover" }}
        />
      </div>
    </div>
  );
}

function HowToBuy(props) {
  return (
    <div className="flex flex-col items-start justify-center bg-background text-foreground">
      <div className="max-w-3xl space-y-6 text-left">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          How to Buy/Sell?
        </h1>
        <Image
          src="/placeholder.svg"
          alt="How it works"
          width={1200}
          height={400}
          className="mx-auto w-full max-w-3xl rounded-lg object-cover"
          style={{ aspectRatio: "1200/400", objectFit: "cover" }}
        />
        <ol className="space-y-4 text-lg md:text-xl list-decimal pl-5">
          <li>
            Connect your wallet and choose the token you're interested in.
          </li>
          <li>
            Open the token’s page, where you'll find the swap window on the
            right.
          </li>
          <li>
            Enter the amount of ETH or tokens you wish to buy or sell, and the
            system will display the equivalent amount in tokens.
          </li>
          <li>Confirm the transaction, and you're done!</li>
        </ol>
      </div>
    </div>
  );
}

function ServiceFee(props) {
  return (
    <div className="flex flex-col items-start justify-center bg-background text-foreground">
      <div className="max-w-3xl space-y-6 text-left">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          Service fee
        </h1>
        <FeeTable />
        <div className="space-y-4 text-lg md:text-xl">
          When $PUMP official token will be live, half of all service fees will
          be used to buyback and burn it!
        </div>
      </div>
    </div>
  );
}

function Links(props) {
  return (
    <div className="flex flex-col items-start justify-center bg-background text-foreground">
      <div className="max-w-3xl space-y-6 text-left">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          Links
        </h1>
        <ul className="space-y-4 text-lg md:text-xl">
          <li>
            Website:{" "}
            <a href="https://pump.style" className="text-blue-500">
              https://pump.style
            </a>
          </li>
          <li>
            Twitter:{" "}
            <a href="https://x.com/pumpdotstyle" className="text-blue-500">
              https://x.com/pumpdotstyle
            </a>
          </li>
          <li>
            Telegram:{" "}
            <a href="https://t.me/pumpdotstyle" className="text-blue-500">
              https://t.me/pumpdotstyle
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
function Support(props) {
  return (
    <div className="flex flex-col items-start justify-center bg-background text-foreground">
      <div className="max-w-3xl space-y-6 text-left">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          Support
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl">
          If you need any help or encounter any issues while using Pump.style,
          we're here to assist you. Here’s how you can get support:
        </p>
        <ul className="space-y-4 text-lg md:text-xl">
          <li>
            <strong>Telegram:</strong> Join our Telegram support group at{" "}
            <a href="https://t.me/pumpdotstyle" className="text-blue-500">
              https://t.me/pumpdotstyle
            </a>{" "}
            and ask your questions.
          </li>
          {/* <li>
                  <strong>Email:</strong> You can reach out to our support team
                  via email at{" "}
                  <a href="mailto:support@pump.style" className="text-blue-500">
                    support@pump.style
                  </a>
                  .
                </li> */}
          {/* <li>
                  <strong>FAQ:</strong> Visit our FAQ section for answers to
                  common questions.
                </li> */}
        </ul>
      </div>
    </div>
  );
}

function BookIcon(props) {
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function BookOpenIcon(props) {
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
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function CircleHelpIcon(props) {
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
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function CodeIcon(props) {
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
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function CompassIcon(props) {
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
      <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function HomeIcon(props) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function LayersIcon(props) {
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
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}

function MenuIcon(props) {
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function VolumeXIcon(props) {
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
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" x2="16" y1="9" y2="15" />
      <line x1="16" x2="22" y1="9" y2="15" />
    </svg>
  );
}

function IoExitOutlineIcon(props) {
  return <div className="w-5 h-5">IoExitOutline</div>;
}

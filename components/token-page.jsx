/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/lykI2OazRKZ
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

/** Add fonts into your Next.js project:

import { Libre_Franklin } from 'next/font/google'
import { IBM_Plex_Sans } from 'next/font/google'

libre_franklin({
  subsets: ['latin'],
  display: 'swap',
})

ibm_plex_sans({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";

export function TokenPage() {
  const tokenAddress = "0x947fd87ec69e47c451f1a0348c0fa7f81166908b";
  // Format the token address for display (e.g., "0x1234...5678")
  const formattedAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(
    -4
  )}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <img
            src="/placeholder.svg"
            width={48}
            height={48}
            alt="Token Icon"
            className="rounded-full"
            style={{ aspectRatio: "48/48", objectFit: "cover" }}
          />
          <div>
            <h1 className="text-2xl font-bold">Acme Token</h1>
            <div className="text-muted-foreground">ACM</div>
          </div>
        </div>
        <p className="text-muted-foreground mb-6">
          Acme Token is a decentralized cryptocurrency that powers the Acme
          ecosystem. It is used for transactions, governance, and staking.
        </p>

        <div className="flex items-center justify-between mb-6">
          {/* Left side with icons */}
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition"
              prefetch={false}
            >
              <GlobeIcon className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition"
              prefetch={false}
            >
              <TwitterIcon className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition"
              prefetch={false}
            >
              <TextIcon className="h-5 w-5" />
            </Link>
          </div>

          {/* Right side with token address and copy button */}
          <div className="flex items-center gap-2">
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

        <div className="h-[400px] bg-muted rounded-lg overflow-hidden">
          <div />
        </div>
      </div>
      <div className="flex flex-col gap-8 h-full">
        <Card className="flex flex-col h-[282px]">
          <CardHeader className="border-b">
            <CardTitle>Buy / Sell</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-hide pr-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" placeholder="Enter amount" />
                </div>
                <div className="flex gap-4 w-full">
                  <Button className="flex-1">Buy</Button>
                  <Button variant="secondary" className="flex-1">
                    Sell
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex flex-col h-[282px]">
          <CardHeader className="border-b">
            <CardTitle>Token Stats</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-hide pr-4">
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <div className="text-muted-foreground">TVL</div>
                  <div className="font-bold">$12.3M</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Market Cap</div>
                  <div className="font-bold">$45.6M</div>
                </div>
                <div>
                  <div className="text-muted-foreground">FDV</div>
                  <div className="font-bold">$78.9M</div>
                </div>
                <div>
                  <div className="text-muted-foreground">1D Volume</div>
                  <div className="font-bold">$1.2M</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-full">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>$ACM</TableHead>
                  <TableHead>For</TableHead>
                  <TableHead>USD</TableHead>
                  <TableHead>Wallet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>2023-04-01</TableCell>
                  <TableCell className="text-green-500">Buy</TableCell>
                  <TableCell>10.5</TableCell>
                  <TableCell>1.16 ETH</TableCell>
                  <TableCell>$26.25</TableCell>
                  <TableCell>0xD1Fa...0cB7</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2023-04-02</TableCell>
                  <TableCell className="text-red-500">Sell</TableCell>
                  <TableCell>5.0</TableCell>
                  <TableCell>2991.04 USDT</TableCell>
                  <TableCell>$15.00</TableCell>
                  <TableCell>0xD1Fa...0cB7</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2023-04-03</TableCell>
                  <TableCell className="text-green-500">Buy</TableCell>
                  <TableCell>15.0</TableCell>
                  <TableCell>1.50 ETH</TableCell>
                  <TableCell>$41.25</TableCell>
                  <TableCell>0xD1Fa...0cB7</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2023-04-04</TableCell>
                  <TableCell className="text-red-500">Sell</TableCell>
                  <TableCell>8.0</TableCell>
                  <TableCell>2600.00 USDT</TableCell>
                  <TableCell>$26.00</TableCell>
                  <TableCell>0xD1Fa...0cB7</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2023-04-05</TableCell>
                  <TableCell className="text-green-500">Buy</TableCell>
                  <TableCell>12.0</TableCell>
                  <TableCell>1.20 ETH</TableCell>
                  <TableCell>$34.80</TableCell>
                  <TableCell>0xD1Fa...0cB7</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-full lg:col-span-1 flex flex-col gap-8">
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="border-b">
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-hide pr-4">
              <div className="flex flex-col gap-2">
                {[...Array(10)].map((_, index) => (
                  <>
                    <div
                      key={`other-${index}`}
                      className="flex items-start gap-4 mt-4"
                    >
                      <Avatar>
                        <AvatarImage
                          src={`/placeholder.svg?height=40&width=40`}
                          alt="User Avatar"
                        />
                        <AvatarFallback>U{index + 1}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1 text-sm">
                        <div className="font-medium">User {index + 1}</div>
                        <div className="bg-muted px-3 py-2 rounded-lg max-w-[80%]">
                          This is a message from User {index + 1}.
                        </div>
                      </div>
                    </div>
                    <div
                      key={`you-${index}`}
                      className="flex items-start gap-4 justify-end"
                    >
                      <div className="grid gap-1 text-sm">
                        <div className="font-medium text-right">You</div>
                        <div className="bg-primary px-3 py-2 rounded-lg max-w-[80%] text-primary-foreground ml-auto">
                          This is your response to User {index + 1}.
                        </div>
                      </div>
                      <Avatar>
                        <AvatarImage
                          src="/placeholder.svg?height=40&width=40"
                          alt="Your Avatar"
                        />
                        <AvatarFallback>YO</AvatarFallback>
                      </Avatar>
                    </div>
                  </>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <div className="relative w-full mt-4">
              <Textarea
                placeholder="Type your message..."
                className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16 scrollbar-hide"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute w-8 h-8 top-3 right-3"
              >
                <ArrowUpIcon className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="col-span-full lg:col-span-1 flex flex-col gap-8">
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="border-b">
            <CardTitle>Holder Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-hide pr-4">
              <div className="grid gap-2">
                {[...Array(20)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between mt-4"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full bg-${
                          ["primary", "secondary", "muted", "accent", "card"][
                            index % 5
                          ]
                        }`}
                      />
                      <div>
                        <div className="font-medium">Holder {index + 1}</div>
                        <div className="text-muted-foreground text-sm">
                          {(20 - index).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ArrowUpIcon(props) {
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
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
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

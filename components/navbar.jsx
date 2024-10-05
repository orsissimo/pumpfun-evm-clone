import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ConnectWallet from "./connect-wallet";
import { FaWandMagicSparkles, FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import { Menu } from "lucide-react";

export function Navbar() {
  return (
    <header className="flex items-center justify-between h-16 px-4 bg-background border-muted sm:px-6">
      <div className="flex gap-x-12">
        <Link
          href="/"
          className="flex items-center gap-2 hover:text-primary transition-colors"
          prefetch={false}
        >
          <FaWandMagicSparkles className="h-7 w-7" />
          <span className="text-lg font-semibold">pump.style</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="https://t.me/pumpdotstyle"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex"
          prefetch={false}
        >
          <FaTelegramPlane className="h-5 w-5 mx-1 hover:opacity-80" />
        </Link>
        <Link
          href="https://x.com/pumpdotstyle"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex"
          prefetch={false}
        >
          <FaXTwitter className="h-5 w-5 mx-1 hover:opacity-80" />
        </Link>

        <Link
          href="/create"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          prefetch={false}
        >
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Create
          </Button>
        </Link>
        <ConnectWallet />
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted transition-colors"
            >
              <SettingsIcon className="h-5 w-5" />
              <span className="sr-only">Open user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-muted transition-colors">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-muted transition-colors">
              Preferences
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-muted transition-colors">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted transition-colors sm:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open mobile menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="hover:bg-muted transition-colors">
              <Link href="/create" className="flex w-full" prefetch={false}>
                <Button
                  variant="outline"
                  size="sm"
                  className="sm:inline-flex hover:bg-primary hover:text-primary-foreground transition-colors w-full"
                >
                  Create
                </Button>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-muted transition-colors">
              <Link href="/docs" className="flex w-full" prefetch={false}>
                <Button
                  variant="outline"
                  size="sm"
                  className="sm:inline-flex hover:bg-primary hover:text-primary-foreground transition-colors w-full"
                >
                  Docs
                </Button>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="flex align-middle justify-center">
              <DropdownMenuItem className="hover:bg-muted transition-colors">
                <Link
                  href="https://t.me/pumpdotstyle"
                  className="flex items-center gap-2 w-full"
                  prefetch={false}
                >
                  <FaTelegramPlane className="h-6 w-6 mx-1 my-2 hover:text-blue-500" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-muted transition-colors">
                <Link
                  href="https://x.com/pumpdotstyle"
                  className="flex items-center gap-2 w-full"
                  prefetch={false}
                >
                  <FaXTwitter className="h-6 w-6 mx-1 my-2 hover:text-blue-500" />
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function SettingsIcon(props) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

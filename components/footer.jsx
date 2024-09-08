/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/eHoAIIGXttB
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

/** Add fonts into your Next.js project:

import { Inter } from 'next/font/google'

inter({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
import Link from "next/link";
import { FaWandMagicSparkles, FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-background py-8 w-full border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-sm text-muted-foreground">
          &copy; pump.style 2024
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          {/* <Link
            href="#"
            className="hover:underline underline-offset-4"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="hover:underline underline-offset-4"
            prefetch={false}
          >
            Privacy Policy
          </Link> */}
          <Link
            href="https://t.me/pumpdotstyle"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            prefetch={false}
          >
            <FaTelegramPlane className="h-5 w-5 mx-1" />
          </Link>
          <Link
            href="https://x.com/pumpdotstyle"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            prefetch={false}
          >
            <FaXTwitter className="h-5 w-5 mx-1" />
          </Link>
          <Link
            href="https://x.com/pumpdotstyle"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            Support
          </Link>
          <Link
            href="/docs"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            Docs
          </Link>
        </div>
      </div>
    </footer>
  );
}

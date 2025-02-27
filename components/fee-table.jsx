/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/3K47lKkViTA
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

/** Add fonts into your Next.js project:

import { Cormorant_Garamond } from 'next/font/google'
import { Judson } from 'next/font/google'

cormorant_garamond({
  subsets: ['latin'],
  display: 'swap',
})

judson({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export function FeeTable() {
  return (
    <div className="flex flex-col items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-3xl">
        <div className="overflow-auto border rounded-lg text-lg md:text-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Token Creation</TableCell>
                <TableCell>No fees (excluding gas fees)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Trading on pump.style</TableCell>
                <TableCell>1% fee on buys/sells</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Listing on Uniswap</TableCell>
                <TableCell>
                  4% in ETH (rebalanced into the bonding curve)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

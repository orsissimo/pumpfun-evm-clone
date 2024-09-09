import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import {
  Bounce,
  Flip,
  Slide,
  ToastContainer,
  Zoom,
  toast,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pump.Style",
  description:
    "Launch and trade coins instantly without the need of adding liquidity",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "production" && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
            ></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        <Navbar />
        <ToastContainer
          position="bottom-right"
          closeOnClick
          theme="dark"
          transition={Bounce}
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}

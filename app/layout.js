import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ToastContainer, toast } from "react-toastify";
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
      <head>{/* You can include meta tags, link tags, etc., here */}</head>
      <body className={inter.className}>
        <Navbar />
        <ToastContainer />
        {children}
        <Footer />
      </body>
    </html>
  );
}

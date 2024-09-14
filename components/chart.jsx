"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
} from "lightweight-charts";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";

export default function CandlestickChart({ transactions }) {
  const [timeframe, setTimeframe] = useState("1m");
  const chartContainerRef = useRef();
  const chartInstanceRef = useRef(); // Use a ref to store the chart instance
  const candlestickSeriesRef = useRef(); // Use a ref to store the candlestick series

  useEffect(() => {
    if (transactions.length > 0) {
      plotCandlestickChart(transactions);
    }
    // Cleanup the chart when the component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [transactions, timeframe]);

  function formatTransactionsForCandlestick(transactions, timeframe) {
    const timeframes = {
      "1s": 1,
      "1m": 60,
      "5m": 60 * 5,
      "15m": 60 * 15,
      "1H": 60 * 60,
      "4H": 60 * 60 * 4,
      "1D": 60 * 60 * 24,
    };

    const interval = timeframes[timeframe];
    const ohlc = [];

    // Sort transactions by timestamp in ascending order
    const sortedTransactions = transactions.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    let currentCandle = null;

    sortedTransactions.forEach((tx) => {
      const timestamp = Math.floor(new Date(tx.timestamp).getTime() / 1000); // Using seconds
      const ethPriceAtTime = Number(tx.ethPriceAtTime);
      const pricePerToken = Number(tx.pricePerToken);
      const price = (pricePerToken * ethPriceAtTime) / 10 ** 18; // Price calculation formula

      const volume = Number(tx.tokensBought || tx.tokensSold) / 10 ** 18; // Adjust volume for precision

      // Handle timeframe bucketing
      const candleStartTime = timestamp - (timestamp % interval);

      // If new candle timeframe begins or no candle exists yet
      if (!currentCandle || currentCandle.time !== candleStartTime) {
        if (currentCandle) {
          ohlc.push(currentCandle); // Push the previous candle when the new one starts
        }

        currentCandle = {
          time: candleStartTime,
          open: currentCandle ? currentCandle.close : price, // Open is the previous candle's close, or current price if no previous candle
          high: price,
          low: price,
          close: price,
          volume: volume,
        };
      }

      // Update the current candle with new transaction data
      currentCandle.high = Math.max(currentCandle.high, price);
      currentCandle.low = Math.min(currentCandle.low, price);
      currentCandle.close = price;
      currentCandle.volume += volume;
    });

    if (currentCandle) {
      ohlc.push(currentCandle);
    }

    return ohlc;
  }

  function plotCandlestickChart(transactions) {
    // Check if chart has already been created
    if (chartInstanceRef.current) {
      // Clear previous series before re-adding new data
      candlestickSeriesRef.current.setData(
        formatTransactionsForCandlestick(transactions, timeframe)
      );
      return;
    }

    const chartContainer = chartContainerRef.current;
    const newChart = createChart(chartContainer, {
      width: chartContainer.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: "#18181b" },
        textColor: "#E6E6E6",
      },
      grid: {
        vertLines: { color: "#303036" },
        horzLines: { color: "#303036" },
      },
      rightPriceScale: {
        borderColor: "#303036",
        priceFormat: {
          type: "custom",
          formatter: (price) => {
            const fixedPrice = price.toFixed(8);
            return fixedPrice.replace(/\.?0+$/, "");
          },
        },
      },
      timeScale: {
        borderColor: "#303036",
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    });

    const candlestick = newChart.addCandlestickSeries({
      upColor: "#33CC90",
      downColor: "#FF007A",
      borderUpColor: "#33CC90",
      borderDownColor: "#FF007A",
      wickUpColor: "#33CC90",
      wickDownColor: "#FF007A",
    });

    const formattedData = formatTransactionsForCandlestick(
      transactions,
      timeframe
    );
    candlestick.setData(formattedData);

    // Add horizontal price lines
    const prices = formattedData.map((candle) => candle.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Create 5 evenly spaced price lines
    for (let i = 0; i <= 4; i++) {
      const linePrice = minPrice + (priceRange * i) / 4;
      const priceLine = {
        price: linePrice,
        color: "#303036",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false,
        title: "",
      };
      candlestick.createPriceLine(priceLine);
    }

    newChart.applyOptions({
      width: chartContainer.clientWidth,
      localization: {
        priceFormatter: (price) => {
          const fixedPrice = price.toFixed(8);
          return fixedPrice.replace(/\.?0+$/, "");
        },
      },
    });

    chartInstanceRef.current = newChart; // Store chart instance in ref
    candlestickSeriesRef.current = candlestick; // Store series instance in ref

    // Handle chart resizing
    const handleResize = () => {
      newChart.applyOptions({
        width: chartContainer.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      newChart.remove();
    };
  }

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  /* const tokenAddress = "0xdfedBfaeEdaA8b005F3c18E33843948b3D50bCc5"; // Hardcoded, to change
  // Format the token address for display (e.g., "0x1234...5678")
  const formattedAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(
    -4
  )}`; */

  return (
    <div className="flex flex-col space-y-4 w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full space-y-2 sm:space-y-0">
        <Label className="text-lg font-semibold mb-2 sm:mb-0">
          {/* <span>Creator : </span>
          <Link
            className="text-muted-foreground cursor-pointer !text-blue-500 hover:underline"
            href={`https://etherscan.io/address/${tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
          >
            {formattedAddress}
          </Link> */}
        </Label>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          {["1s", "1m", "5m", "15m", "1H", "4H", "1D"].map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "secondary" : "outline"}
              onClick={() => handleTimeframeChange(tf)}
              className="px-2 py-1 text-sm w-[42px]"
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>
      <Card className="w-full">
        <CardContent>
          <div
            id="chart"
            ref={chartContainerRef}
            className="w-full h-[397px]"
          ></div>
        </CardContent>
      </Card>
    </div>
  );
}

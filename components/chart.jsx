"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType } from "lightweight-charts";
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

    transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    let currentCandle = null;

    transactions.forEach((tx) => {
      const timestamp = Math.floor(new Date(tx.timestamp).getTime() / 1000);
      const price = Number(tx.pricePerToken) / 10 ** 18;
      const volume = Number(tx.tokensBought || tx.tokensSold) / 10 ** 18;

      if (!currentCandle || timestamp - currentCandle.time >= interval) {
        if (currentCandle) {
          ohlc.push(currentCandle);
        }

        currentCandle = {
          time: timestamp - (timestamp % interval),
          open: price,
          high: price,
          low: price,
          close: price,
          volume: volume,
        };
      }

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
      },
      timeScale: {
        borderColor: "#303036",
      },
    });

    const candlestick = newChart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    candlestick.setData(
      formatTransactionsForCandlestick(transactions, timeframe)
    );

    chartInstanceRef.current = newChart; // Store chart instance in ref
    candlestickSeriesRef.current = candlestick; // Store series instance in ref

    window.addEventListener("resize", () => {
      newChart.applyOptions({ width: chartContainer.clientWidth });
    });
  }

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  const address = "0xdfedBfaeEdaA8b005F3c18E33843948b3D50bCc5"; // Hardcoded, to change
  // Format the token address for display (e.g., "0x1234...5678")
  const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm flex items-end space-x-1">
          <span>Creator : </span>
          <Link
            className="text-muted-foreground cursor-pointer !text-blue-500 hover:underline"
            href={`https://etherscan.io/address//${address}`}
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
          >
            {formattedAddress}
          </Link>
        </Label>
        <div className="flex space-x-2">
          {["1s", "1m", "5m", "15m", "1H", "4H", "1D"].map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "secondary" : "outline"}
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>
      <Card>
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

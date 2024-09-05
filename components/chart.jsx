"use client";

import { useEffect, useState } from "react";
import { createChart, ColorType } from "lightweight-charts";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";

export default function CandlestickChart({ transactions }) {
  const [timeframe, setTimeframe] = useState("1m");
  const [chart, setChart] = useState(null);
  const [candlestickSeries, setCandlestickSeries] = useState(null);

  useEffect(() => {
    if (transactions.length > 0) {
      plotCandlestickChart(transactions);
    }
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
    const chartContainer = document.getElementById("chart");

    if (chart) {
      chart.remove();
    }

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

    const chartData = formatTransactionsForCandlestick(transactions, timeframe);
    candlestick.setData(chartData);

    setChart(newChart);
    setCandlestickSeries(candlestick);

    window.addEventListener("resize", () => {
      newChart.applyOptions({ width: chartContainer.clientWidth });
    });
  }

  const handleTimeframeChange = (timeframe) => {
    setTimeframe(timeframe);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-md">Creator: 0x1234...5678</Label>
        <div className="flex space-x-2">
          <Button
            variant={timeframe === "1s" ? "secondary" : "outline"}
            onClick={() => handleTimeframeChange("1s")}
          >
            1s
          </Button>
          <Button
            variant={timeframe === "1m" ? "secondary" : "outline"}
            onClick={() => handleTimeframeChange("1m")}
          >
            1m
          </Button>
          <Button
            variant={timeframe === "5m" ? "secondary" : "outline"}
            onClick={() => handleTimeframeChange("5m")}
          >
            5m
          </Button>
          <Button
            variant={timeframe === "15m" ? "secondary" : "outline"}
            onClick={() => handleTimeframeChange("15m")}
          >
            15m
          </Button>
          <Button
            variant={timeframe === "1H" ? "secondary" : "outline"}
            onClick={() => handleTimeframeChange("1H")}
          >
            1H
          </Button>
          <Button
            variant={timeframe === "4H" ? "secondary" : "outline"}
            onClick={() => handleTimeframeChange("4H")}
          >
            4H
          </Button>
          <Button
            variant={timeframe === "1D" ? "secondary" : "outline"}
            onClick={() => handleTimeframeChange("1D")}
          >
            1D
          </Button>
        </div>
      </div>
      <Card>
        <CardContent>
          <div id="chart" className="w-full h-[400px]">
            <div />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

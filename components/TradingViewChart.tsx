"use client";

import { useEffect, useRef } from "react";
import { toTradingViewSymbol } from "@/lib/market";

export default function TradingViewChart({ pair }: { pair: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !pair) return;
    containerRef.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    containerRef.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: toTradingViewSymbol(pair),
      interval: "15",
      timezone: "America/New_York",
      theme: "dark",
      style: "1",
      locale: "id_ID",
      backgroundColor: "rgba(11, 14, 19, 1)",
      gridColor: "rgba(35, 42, 53, 0.5)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      support_host: "https://www.tradingview.com",
    });
    containerRef.current.appendChild(script);
  }, [pair]);

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-lg border border-line bg-panel">
      <div
        ref={containerRef}
        className="tradingview-widget-container h-full w-full"
      />
    </div>
  );
}

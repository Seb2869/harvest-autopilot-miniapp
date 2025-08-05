import React, { useState, useEffect } from "react";
import BaseChart from "../BaseChart";
import { fetchSharePriceData } from "~/utilities/chartApiCalls";
import { formatBalance } from "~/utilities/parsers";
import { SharePriceChartProps, ChartDataPoint } from "~/types";

export default function SharePriceChart({
  vaultAddress,
  period = "30d",
  height = 250,
  chainId = 8453, // Default to Base chain
  className = "",
  cachedData,
  isLoading: externalLoading = false,
  tokenDecimals = 18,
}: SharePriceChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>(cachedData || []);
  const [loading, setLoading] = useState<boolean>(
    externalLoading || !cachedData,
  );
  const [error, setError] = useState<string | null>(null);
  const [curDate, setCurDate] = useState<string>("");
  const [curValue, setCurValue] = useState<string>("");

  useEffect(() => {
    if (cachedData && !externalLoading) {
      setData(cachedData);
      setLoading(false);

      if (cachedData.length > 0) {
        const latestData = cachedData[cachedData.length - 1];
        setCurDate(new Date(latestData.timestamp).toLocaleDateString());
        setCurValue(formatPrice(latestData.value));
      }
      return;
    }

    setLoading(externalLoading);

    if (externalLoading) {
      return;
    }

    const fetchData = async () => {
      if (!vaultAddress) return;

      setLoading(true);
      setError(null);

      try {
        const priceData = await fetchSharePriceData(
          vaultAddress,
          period,
          chainId,
          tokenDecimals,
        );
        setData(priceData);

        if (priceData.length > 0) {
          const latestData = priceData[priceData.length - 1];
          setCurDate(new Date(latestData.timestamp).toLocaleDateString());
          setCurValue(formatPrice(latestData.value));
        }
      } catch (err) {
        console.error("Error fetching share price data:", err);
        setError("Failed to load share price data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (!cachedData) {
      fetchData();
    }
  }, [
    vaultAddress,
    period,
    chainId,
    cachedData,
    externalLoading,
    tokenDecimals,
  ]);

  const formatPrice = (value: number) => {
    return formatBalance(value.toString());
  };

  const handleDataPointHover = (dataPoint: ChartDataPoint) => {
    setCurDate(new Date(dataPoint.timestamp).toLocaleDateString());
    setCurValue(formatPrice(dataPoint.value));
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow ${className}`}
    >
      <h3 className="text-base font-medium mb-3">Share Price</h3>

      {curDate && curValue && (
        <div className="mb-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">{curDate}:</span>{" "}
          <span className="font-medium">{curValue}</span>
        </div>
      )}

      <BaseChart
        data={data}
        color="#00D26B"
        loading={loading}
        error={error}
        height={height}
        tooltipFormatter={formatPrice}
        yAxisTickFormatter={formatPrice}
        onDataPointHover={handleDataPointHover}
      />
    </div>
  );
}

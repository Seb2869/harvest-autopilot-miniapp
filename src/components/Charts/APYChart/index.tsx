import React, { useState, useEffect } from "react";
import BaseChart from "../BaseChart";
import { fetchAPYData } from "~/utilities/chartApiCalls";
import { APYChartProps, ChartDataPoint } from "~/types";

export default function APYChart({
  vaultAddress,
  period = "30d",
  height = 250,
  chainId = 8453, // Default to Base chain
  cachedData,
  isLoading: externalLoading = false,
}: APYChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>(cachedData || []);
  const [loading, setLoading] = useState<boolean>(
    externalLoading || !cachedData,
  );
  const [error, setError] = useState<string | null>(null);
  const [curDate, setCurDate] = useState<string>("");
  const [curValue, setCurValue] = useState<string>("");

  useEffect(() => {
    // If we have cached data and external loading is false, use cached data
    if (cachedData && !externalLoading) {
      setData(cachedData);
      setLoading(false);

      // Set date and content with latest value
      if (cachedData.length > 0) {
        const latestData = cachedData[cachedData.length - 1];
        setCurDate(new Date(latestData.timestamp).toLocaleDateString());
        setCurValue(formatAPY(latestData.value));
      }
      return;
    }

    // Update loading state from external prop
    setLoading(externalLoading);

    // Skip fetching if we're using external loading control
    if (externalLoading) {
      return;
    }

    const fetchData = async () => {
      if (!vaultAddress) return;

      setLoading(true);
      setError(null);

      try {
        const apyData = await fetchAPYData(vaultAddress, period, chainId);
        setData(apyData);

        // Set date and content with latest value
        if (apyData.length > 0) {
          const latestData = apyData[apyData.length - 1];
          setCurDate(new Date(latestData.timestamp).toLocaleDateString());
          setCurValue(formatAPY(latestData.value));
        }
      } catch (err) {
        console.error("Error fetching APY data:", err);
        setError("Failed to load APY data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if no cached data is provided
    if (!cachedData) {
      fetchData();
    }
  }, [vaultAddress, period, chainId, cachedData, externalLoading]);

  const formatAPY = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Handle tooltip click/hover to update current values
  const handleDataPointHover = (dataPoint: ChartDataPoint) => {
    setCurDate(new Date(dataPoint.timestamp).toLocaleDateString());
    setCurValue(formatAPY(dataPoint.value));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h3 className="text-base font-medium mb-3">Annual Percentage Yield</h3>

      {curDate && curValue && (
        <div className="mb-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">{curDate}:</span>{" "}
          <span className="font-medium">{curValue}</span>
        </div>
      )}

      <BaseChart
        data={data}
        color="#00D26B" // Green color
        loading={loading}
        error={error}
        height={height}
        tooltipFormatter={formatAPY}
        yAxisTickFormatter={formatAPY}
        onDataPointHover={handleDataPointHover}
      />
    </div>
  );
}

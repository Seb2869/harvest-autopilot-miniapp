import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";
import { ChartDataPoint } from "~/types";

interface BaseChartProps {
  data: ChartDataPoint[];
  color?: string;
  dataKey?: string;
  height?: number;
  tooltipFormatter?: (value: number) => string;
  yAxisTickFormatter?: (value: number) => string;
  xAxisTickFormatter?: (value: number) => string;
  loading?: boolean;
  error?: string | null;
  onDataPointHover?: (dataPoint: ChartDataPoint) => void;
}

export default function BaseChart({
  data,
  color = "#00D26B",
  dataKey = "value",
  height = 300,
  tooltipFormatter = (value: number) => `${value.toFixed(2)}`,
  yAxisTickFormatter = (value: number) => `${value.toFixed(2)}`,
  xAxisTickFormatter = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  },
  loading = false,
  error = null,
  onDataPointHover,
}: BaseChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: item.timestamp,
    [dataKey]: item.value,
  }));

  const handleMouseMove = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: any,
  ) => {
    if (
      onDataPointHover &&
      props &&
      props.activePayload &&
      props.activePayload.length > 0
    ) {
      const dataPoint = props.activePayload[0].payload;
      const originalDataPoint: ChartDataPoint = {
        timestamp: dataPoint.timestamp,
        value: dataPoint[dataKey],
      };
      onDataPointHover(originalDataPoint);
    }
  };

  // Custom tooltip component to show only one value
  const CustomTooltip = ({
    active,
    payload,
    label,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }: any) => {
    if (active && payload && payload.length > 0) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString();
      const value = payload[0]?.value || 0;

      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {formattedDate}
          </p>
          <p className="text-xs font-medium flex items-center">
            <span
              className="inline-block w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: color }}
            ></span>
            {tooltipFormatter(value)}
          </p>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <div className="text-gray-500 dark:text-gray-400">
          Loading chart data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="text-red-600 dark:text-red-400 text-center p-4">
          {error}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-gray-500 dark:text-gray-400 text-center p-4">
          No data available
        </div>
      </div>
    );
  }

  const renderCustomXAxisTick = ({
    x,
    y,
    payload,
    index,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }: any) => {
    let path = "";
    let dx = 0;

    if (payload.value !== "") {
      path = xAxisTickFormatter(payload.value);
    }

    if (index === 0) dx = 5; // Adjust the first tick
    if (index === formattedData.length - 1) dx = -10; // Adjust the last tick

    return (
      <text
        orientation="bottom"
        x={x + dx}
        y={y + 4}
        width={24}
        height={24}
        textAnchor={
          index === 0
            ? "start"
            : index === formattedData.length - 1
              ? "end"
              : "middle"
        }
        viewBox="0 0 1024 1024"
        fill="#888"
        fontSize="10px"
      >
        <tspan dy="0.71em">{path}</tspan>
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={formattedData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          onMouseMove={onDataPointHover ? handleMouseMove : undefined}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.1} />
              <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="0"
            strokeLinecap="butt"
            stroke="rgba(228, 228, 228, 0.2)"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tickLine={false}
            tickCount={5}
            tick={renderCustomXAxisTick}
            padding={{ right: 10 }}
          />

          <YAxis
            dataKey={dataKey}
            tickLine={false}
            tickCount={5}
            tick={{ fill: "#888", fontSize: 10 }}
            width={50}
            domain={["auto", "auto"]}
            tickFormatter={yAxisTickFormatter}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: color,
              strokeDasharray: 3,
              strokeLinecap: "butt",
            }}
          />

          <Line
            dataKey={dataKey}
            type="monotone"
            strokeLinecap="round"
            strokeWidth={2}
            stroke={color}
            dot={false}
            activeDot={{ r: 5 }}
            animationDuration={1500}
            isAnimationActive={true}
          />

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUv)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

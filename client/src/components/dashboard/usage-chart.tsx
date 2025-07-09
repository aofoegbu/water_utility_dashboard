import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

export default function UsageChart() {
  const [timeRange, setTimeRange] = useState("7D");

  const { data: chartData, isLoading } = useQuery({
    queryKey: [`/api/water-usage/chart-data/${timeRange}`],
    refetchInterval: 60000, // Refresh every minute
    refetchIntervalInBackground: false, // Only refresh when tab is active
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Water Usage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Water Usage Trend</CardTitle>
          <div className="flex space-x-2">
            {["7D", "30D", "90D"].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? "bg-primary-50 text-primary-600" : ""}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                label={{ value: 'Million Gallons', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="gallons" 
                stroke="hsl(207, 73%, 57%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(207, 73%, 57%)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(207, 73%, 57%)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

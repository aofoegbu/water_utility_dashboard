import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Expand } from "lucide-react";

export default function SystemMap() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Status Map</CardTitle>
          <Button variant="outline" size="sm">
            <Expand className="h-4 w-4 mr-1" />
            Fullscreen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Placeholder for interactive map */}
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-lg">GIS</span>
              </div>
              <p className="text-gray-600 font-medium">Interactive Map</p>
              <p className="text-sm text-gray-500">Truckee Meadows Water System</p>
            </div>
          </div>
          
          {/* Status Indicators Overlay */}
          <div className="absolute top-4 left-4 space-y-2">
            <div className="flex items-center space-x-2 bg-white bg-opacity-90 rounded-lg px-3 py-1 shadow-sm">
              <div className="w-3 h-3 bg-status-success rounded-full"></div>
              <span className="text-sm font-medium">Normal (89)</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-90 rounded-lg px-3 py-1 shadow-sm">
              <div className="w-3 h-3 bg-status-warning rounded-full"></div>
              <span className="text-sm font-medium">Warning (12)</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-90 rounded-lg px-3 py-1 shadow-sm">
              <div className="w-3 h-3 bg-status-critical rounded-full"></div>
              <span className="text-sm font-medium">Critical (7)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

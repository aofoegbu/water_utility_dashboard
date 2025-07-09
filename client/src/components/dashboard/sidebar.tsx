import { BarChart3, Droplet, AlertTriangle, Wrench, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "#", icon: BarChart3, current: true },
  { name: "Water Usage", href: "#", icon: Droplet, current: false },
  { name: "Leak Detection", href: "#", icon: AlertTriangle, current: false },
  { name: "Maintenance", href: "#", icon: Wrench, current: false },
  { name: "Reports", href: "#", icon: FileText, current: false },
  { name: "Customers", href: "#", icon: Users, current: false },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <Droplet className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">TMWA</h1>
            <p className="text-sm text-gray-500">Water Utility</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                item.current
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">JA</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">John Analyst</p>
            <p className="text-xs text-gray-500">MIS Analyst</p>
          </div>
        </div>
      </div>
    </div>
  );
}

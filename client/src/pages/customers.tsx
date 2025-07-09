import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Phone, Mail } from "lucide-react";
import Sidebar from "@/components/dashboard/sidebar";

export default function CustomersPage() {
  // Mock customer data for demonstration
  const customers = [
    {
      id: 1,
      name: "Residential Zone A",
      type: "Residential",
      location: "North District",
      accountCount: 1247,
      avgUsage: "2.3M gal/month",
      status: "Active",
      contact: "555-0101"
    },
    {
      id: 2,
      name: "Industrial Park East",
      type: "Industrial",
      location: "East Zone",
      accountCount: 23,
      avgUsage: "15.8M gal/month",
      status: "Active",
      contact: "555-0102"
    },
    {
      id: 3,
      name: "Commercial District",
      type: "Commercial",
      location: "Downtown",
      accountCount: 342,
      avgUsage: "8.1M gal/month",
      status: "Active",
      contact: "555-0103"
    },
    {
      id: 4,
      name: "Residential Zone B",
      type: "Residential",
      location: "South District",
      accountCount: 987,
      avgUsage: "1.9M gal/month",
      status: "Active",
      contact: "555-0104"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Industrial": return "destructive";
      case "Commercial": return "default";
      case "Residential": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
              <p className="text-sm text-gray-500 mt-1">Manage customer accounts and service areas</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                    <p className="text-3xl font-bold text-gray-900">2,599</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Service Areas</p>
                    <p className="text-3xl font-bold text-gray-900">4</p>
                  </div>
                  <MapPin className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Monthly Usage</p>
                    <p className="text-3xl font-bold text-gray-900">28.1M</p>
                    <p className="text-sm text-gray-500">gallons</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">gal</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Services</p>
                    <p className="text-3xl font-bold text-green-600">100%</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Service Areas & Customer Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {customers.map((customer) => (
                  <Card key={customer.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{customer.location}</span>
                          </div>
                        </div>
                        <Badge variant={getTypeColor(customer.type)}>{customer.type}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Accounts</p>
                          <p className="text-2xl font-bold text-gray-900">{customer.accountCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg Usage</p>
                          <p className="text-lg font-semibold text-gray-900">{customer.avgUsage}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{customer.contact}</span>
                        </div>
                        <Badge variant="secondary">{customer.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Emergency Contact</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>24/7 Emergency: 555-WATER (555-92837)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>emergency@tmwa.gov</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Service Hours</h4>
                  <div className="space-y-1 text-sm text-green-700">
                    <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                    <p>Emergency Service: 24/7</p>
                    <p>Weekend Support: 9:00 AM - 3:00 PM</p>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Service Coverage</h4>
                  <div className="space-y-1 text-sm text-orange-700">
                    <p>Residential Areas: 4 districts</p>
                    <p>Commercial Zones: 2 districts</p>
                    <p>Industrial Parks: 1 zone</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
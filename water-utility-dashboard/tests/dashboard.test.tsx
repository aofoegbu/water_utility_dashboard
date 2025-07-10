import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import Dashboard from "@/pages/dashboard";
import { vi } from "vitest";

// Mock fetch globally
global.fetch = vi.fn();

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderDashboard = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
};

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashboard title", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalUsageToday: "2.4",
        usageChange: "2.1",
        activeLeaks: 7,
        systemPressure: 78,
        pendingMaintenance: 12,
        unreadAlerts: 3
      }),
    });

    renderDashboard();

    expect(screen.getByText("Water System Dashboard")).toBeInTheDocument();
    expect(screen.getByText(/Real-time monitoring and analytics/)).toBeInTheDocument();
  });

  it("displays KPI cards with correct data", async () => {
    const mockKPIs = {
      totalUsageToday: "2.4",
      usageChange: "2.1",
      activeLeaks: 7,
      systemPressure: 78,
      pendingMaintenance: 12,
      unreadAlerts: 3
    };

    (fetch as any).mockImplementation((url: string) => {
      if (url.includes("/api/dashboard/kpis")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockKPIs),
        });
      }
      if (url.includes("/api/alerts?unreadOnly=true")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error("Unexpected fetch call"));
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("2.4M")).toBeInTheDocument();
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.getByText("78")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
    });

    expect(screen.getByText("Total Usage Today")).toBeInTheDocument();
    expect(screen.getByText("Active Leaks")).toBeInTheDocument();
    expect(screen.getByText("System Pressure")).toBeInTheDocument();
    expect(screen.getByText("Pending Tasks")).toBeInTheDocument();
  });

  it("opens report modal when export button is clicked", async () => {
    (fetch as any).mockImplementation((url: string) => {
      if (url.includes("/api/dashboard/kpis")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            totalUsageToday: "2.4",
            usageChange: "2.1",
            activeLeaks: 7,
            systemPressure: 78,
            pendingMaintenance: 12,
            unreadAlerts: 3
          }),
        });
      }
      if (url.includes("/api/alerts?unreadOnly=true")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error("Unexpected fetch call"));
    });

    const user = userEvent.setup();
    renderDashboard();

    const exportButton = await screen.findByText("Export Report");
    await user.click(exportButton);

    expect(screen.getByText("Generate Report")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    (fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderDashboard();

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("displays TMWA branding in sidebar", async () => {
    (fetch as any).mockImplementation((url: string) => {
      if (url.includes("/api/dashboard/kpis")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            totalUsageToday: "2.4",
            usageChange: "2.1",
            activeLeaks: 7,
            systemPressure: 78,
            pendingMaintenance: 12,
            unreadAlerts: 3
          }),
        });
      }
      if (url.includes("/api/alerts?unreadOnly=true")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error("Unexpected fetch call"));
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("TMWA")).toBeInTheDocument();
      expect(screen.getByText("Water Utility")).toBeInTheDocument();
    });
  });
});

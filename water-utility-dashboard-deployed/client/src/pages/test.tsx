import { useQuery } from "@tanstack/react-query";

export default function TestPage() {
  const { data: kpis, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/kpis"],
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold">API Data:</h2>
        <pre className="mt-2 text-sm">
          {JSON.stringify(kpis, null, 2)}
        </pre>
      </div>
    </div>
  );
}
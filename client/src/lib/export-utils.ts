export function downloadCSV(data: any[], filename: string) {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function downloadJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function formatDataForExport(data: any[], type: 'usage' | 'leaks' | 'maintenance' | 'alerts') {
  switch (type) {
    case 'usage':
      return data.map(item => ({
        Date: new Date(item.timestamp).toLocaleDateString(),
        Location: item.location,
        'Gallons Used': item.gallons,
        'Pressure (PSI)': item.pressure,
        'Flow Rate (GPM)': item.flowRate,
        'Temperature (°F)': item.temperature || 'N/A'
      }));
    
    case 'leaks':
      return data.map(item => ({
        'Detection Date': new Date(item.detectedAt).toLocaleDateString(),
        Location: item.location,
        Severity: item.severity,
        Status: item.status,
        'Estimated Loss (Gallons)': item.estimatedGallonsLost || 'N/A',
        'Assigned Technician': item.assignedTechnician || 'Unassigned',
        Notes: item.notes || ''
      }));
    
    case 'maintenance':
      return data.map(item => ({
        'Scheduled Date': new Date(item.scheduledDate).toLocaleDateString(),
        'Task Type': item.taskType,
        Location: item.location,
        Priority: item.priority,
        Status: item.status,
        'Assigned Technician': item.assignedTechnician,
        Description: item.description,
        'Estimated Duration (min)': item.estimatedDuration || 'N/A',
        'Cost ($)': item.cost || 'N/A'
      }));
    
    case 'alerts':
      return data.map(item => ({
        Timestamp: new Date(item.timestamp).toLocaleString(),
        Type: item.type,
        Severity: item.severity,
        Location: item.location,
        Message: item.message,
        'Read Status': item.isRead ? 'Read' : 'Unread'
      }));
    
    default:
      return data;
  }
}

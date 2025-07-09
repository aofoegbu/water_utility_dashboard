// Quick test script to verify ERP/CRM server functionality
const http = require('http');

const server = require('./server');

// Start server on port 3000
const PORT = 3000;
const httpServer = server.listen(PORT, () => {
  console.log(`✅ ERP/CRM Integration Server started on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔍 API Health Check: http://localhost:${PORT}/api/integration/health`);
  
  // Run a quick test
  setTimeout(() => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/integration/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.data.overall) {
            console.log(`✅ Health Check Passed: System Status = ${response.data.overall}`);
            console.log(`✅ CRM System: ${response.data.systems.crm.status} (${response.data.systems.crm.responseTime}ms)`);
            console.log(`✅ ERP System: ${response.data.systems.erp.status} (${response.data.systems.erp.responseTime}ms)`);
            console.log('🎉 ERP/CRM Integration Tool is ready for portfolio demonstration!');
          } else {
            console.log('❌ Health check failed');
          }
        } catch (error) {
          console.log('❌ Error parsing health check response:', error.message);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Health check request failed:', error.message);
    });

    req.end();
  }, 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down ERP/CRM server...');
  httpServer.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

module.exports = httpServer;
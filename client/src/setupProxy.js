const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // no rewrite needed
      },
      // For debugging
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request:', req.method, req.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Received response:', proxyRes.statusCode);
      }
    })
  );
};
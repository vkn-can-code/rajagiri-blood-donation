const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Explicitly proxy /uploads to the backend server.
  // This bypasses the React Router so users don't get a 404 NotFound page 
  // when clicking certificate links, and allows Ngrok to cleanly retrieve the images.
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );
};

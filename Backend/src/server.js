require('dotenv').config();
const app = require('./app');

// --- FIX: Ensure this import is present ---
const initCronJobs = require('./jobs/cron'); 

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server launched on http://localhost:${PORT}`);
  
  // Start the background jobs
  // We add a check to prevent crashing if the module is missing/empty
  if (typeof initCronJobs === 'function') {
    initCronJobs();
  } else {
    console.warn("⚠️ Warning: initCronJobs is not a function. Check src/jobs/cron.js");
  }
});
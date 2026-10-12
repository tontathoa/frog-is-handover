// PM2 config for production. nginx proxies the domain to this port (deploy/nginx-frogis.conf) —
// change the port in both places. Bound to 127.0.0.1 so the app is only reachable through nginx.
// Everything else (database login, AUTH_SECRET, SITE_URL) comes from .env.local on the server.
module.exports = {
  apps: [
    {
      name: 'frogis-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3040',
      cwd: __dirname,
      watch: false,
      max_memory_restart: '600M',
      env: { NODE_ENV: 'production' },
    },
  ],
};

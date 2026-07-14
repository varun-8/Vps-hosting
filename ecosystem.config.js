module.exports = {
  apps: [
    {
      name: "vps-hosting-backend",
      script: "./backend/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5001
      }
    }
  ]
};

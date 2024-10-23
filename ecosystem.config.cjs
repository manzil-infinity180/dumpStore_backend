module.exports = {
  apps: [
    {
      name: "api-server",
      script: "dist/server.js",
      instances: 1,
    },
    {
      name: "email-worker",
      script: "dist/utils/consumer.js",
      instances: 1,
      autorestart: true,
    },
  ],
};

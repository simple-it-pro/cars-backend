module.exports = {
  apps: [
    {
      name: 'cars-backend',
      script: 'dist/src/main.js',
      cwd: '/var/www/cars-backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};

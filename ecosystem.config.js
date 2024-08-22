module.exports = {
  apps: [
    {
      name: 'movie-booking-app',
      script: 'dist/src/main.js',
      watch: false,
      exec_mode: 'cluster',
      instances: 2,
    },
  ],
};

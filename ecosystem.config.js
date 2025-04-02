module.exports = {
  apps: [
    {
      name: 'library-rest-api',
      script: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'library-graphql-api',
      script: 'dist/graphqlServer.js',
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
}

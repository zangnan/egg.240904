module.exports = () => ({
  mysql: {
    client: {
      host: '127.0.0.1',
      port: '3306',
      user: 'egguser',
      password: process.env.DB_PASS || 'z3K7W57SJNMa47MJ',
      database: 'eggdb',
    },
    app: true,
    agent: false,
  },
});
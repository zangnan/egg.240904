/* eslint valid-jsdoc: "off" */
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1725419470236_467';

  // add your middleware config here
  // config.middleware = [];

  // 中间件
  // config.middleware = [ 'errorHandler', 'authorization', 'userLog' ];
  // config.middleware = [ 'authorization' ];
  // config.middleware = [ 'writeApiLog' ];
  config.middleware = [ 'authorization', 'writeApiLog' ];
  // 开启中间件，登录页不需要权限认证
  config.authorization = {
    enable: true,
    // enable: false,
    ignore: [ '/dict/security/login',
      '/dict/login/getLoginUserInfo',
      '/ns/base/list/sys_menu',
      '/api/v0.1/ddit/base/getToken',
      '/api/v2/example/test01',
      '/api/v2/example/test02/:id/:name',
      '/api/v0.1/ddit/agentIp/getIp',
      '/api/v0.1/ddit/base/mail/testSendMail',
      '/api/v0.1/ddit/base/mail/sendUserMail',
      '/api/v0.1/ddit/agentIp/manager',
      '/ns/db/createTables',
      '/ns/base/initDbData' ], // 只忽略指定路由，可以用ignore
  };
  config.writeApiLog = {
    enable: true,
    // enable: false,
    ignore: [ '/dict/security/login',
      '/ns/base/list/sys_menu',
      '/ns/db/createTables',
      '/ns/base/initDbData' ], // 只忽略指定路由，可以用ignore
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.mysql = {
    client: {
      host: '192.168.21.5',
      // host: '127.0.0.1',
      port: '3306',
      user: 'root',
      password: 'root',
      database: 'qucik_dev',
    },
    app: true, // 是否加载到 app 上，默认开启
    agent: false, // 是否加载到 agent 上，默认关闭
  };
  // jwt
  config.jwt = { secret: '123456' };
  // security
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: [ 'http://localhost:8080', 'http://localhost:7001', 'http://127.0.0.1:7001' ],
  };
  // 跨域配置
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };
  // 文件流式上传
  config.multipart = {
    fileSize: '100mb',
    fileExtensions: [ 'xlsx', 'xls', 'pptx', 'flac' ],
    // mode: 'stream', // 'file'
    // autoFields: false,
    // defaultCharset: 'utf8',
    // fieldNameSize: 100,
    // fields: 50,
    // allowArrayField: true,
    // whitelist: null,
    // tmpdir: path.join(os.tmpdir(), 'egg-multipart-tmp', appInfo.name),
    // cleanSchedule: {
    //   // run tmpdir clean job on every day 04:30 am
    //   // cron style see https://github.com/eggjs/egg-schedule#cron-style-scheduling
    //   cron: '0 30 4 * * *',
    // },
  };
  // config.assets = {
  // publicPath: '/public/',
  // };
  config.static = {
    publicPath: '/public/',
    dynamic: true,
    preload: false,
    maxAge: 1,
    // buffer: false,
    // 静态化访问前缀,如：`http://127.0.0.1:7001/static/images/logo.png`
    prefix: '/static',
    // dir: path.join(appInfo.baseDir, 'app/public'), // `String` or `Array:[dir1, dir2, ...]` 静态化目录,可以设置多个静态化目录
    // dynamic: true, // 如果当前访问的静态资源没有缓存，则缓存静态文件，和`preload`配合使用；
    // preload: false,
    // maxAge: 31536000, // in prod env, 0 in other envs
    // buffer: true, // in prod env, false in other envs
  };

  // swagger 配置 [1,2](@ref)
  config.swaggerdoc = {
    dirScanner: './app/controller', // 扫描的控制器路径
    // basePath: '/api',
    apiInfo: {
      title: 'Egg.jsAPI接口文档', // 文档标题
      description: '基于Egg.js的Swagger接口文档(自动生成)', // 文档描述
      version: '1.0.0', // API 版本
    },
    schemes: [ 'http', 'https' ], // 支持的协议
    consumes: [ 'application/json' ], // 接收的内容类型
    produces: [ 'application/json' ], // 返回的内容类型
    // securityDefinitions: { // JWT 认证配置 [5](@ref)
    //   // apikey: {
    //   //   type: 'apiKey',
    //   //   name: 'Authorization',
    //   //   in: 'header',
    //   // },
    //   // bearerAuth: {
    //   //   type: 'http',
    //   //   scheme: 'bearer',
    //   //   bearerFormat: 'JWT',
    //   //   description: 'JWT Bearer Token认证',
    //   // },
    // },
    enableSecurity: false, // 启用认证
    enableValidate: true, // 启用参数校验
    routerMap: true, // 自动生成路由
    enable: true, // 启用 swagger-ui
  };

  return {
    ...config,
    ...userConfig,
  };
};

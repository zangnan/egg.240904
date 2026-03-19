const util = require('util');
const Transport = require('egg-logger').Transport;

class RemoteErrorTransport extends Transport {
  // 定义 log 方法。在此方法中，将日志上报给远端服务。
  log(level, args) {
    // console.info('记录的日志信息 ~~~~~~~~~~~~~~~~ Start 111 app config');
    let log_name;
    let message;
    let err_stack;
    let pid = process.pid;
    let log;
    let request_url;
    let log_request; // 请求参数
    let request_header; // 请求头
    let user_agent; // 用户代理
    let ip_address;
    let error_code;
    // let response_body; // 响应数据
    if (args[0] instanceof Error) {
      const args0 = args[0];
      const { errorCode, cause = {}, name, stack } = args0;
      log_name = name || cause.name;
      message = args0.message;
      // err_stack = cause.stack || stack;
      err_stack = stack;
      pid = process.pid;
      error_code = errorCode;
      if (args.length > 1) {
        const { ctx } = args[1];
        request_url = ctx.request.url;
        log_request = ctx.request.body; // 请求参数
        request_header = ctx.request.header; // 请求头
        user_agent = ctx.request.header['sec-ch-ua']; // 用户代理
        ip_address = ctx.request.header.origin;
      }
      log = util.format(
        '%s: %s\n%s\npid: %s\n',
        args0.name,
        args0.message,
        err_stack,
        process.pid
      );
    } else {
      // console.info(args);
      log = util.format(...args);
      log_name = args.length > 0 ? args[0] : '';
      message = log;
    }
    const Literal = this.options.app.mysql.literals.Literal;
    const timeStart1 = new Date();
    const logData = {
      uuid: new Literal('UUID()'),
      level,
      log_name,
      message,
      err_stack,
      pid,
      error_code,
      start_time: timeStart1,
      ip_address,
      user_agent,
      request_url,
      request_header: JSON.stringify(request_header),
      request_body: JSON.stringify(log_request),
    };
    this.options.app.mysql.insert('sys_app_log', logData);
    // console.info('启动耗时 %d ms', Date.now() - start);
    // console.info('记录的日志信息 ~~~~~~~~~~~~~~~~ End');
  }
}

module.exports = app => {
  // app.getLogger('errorLogger').set('remote', new RemoteErrorTransport({ level: 'ERROR', app }));
  app.getLogger('logger').set('remote', new RemoteErrorTransport({ level: 'INFO', app }));
  app.on('error', (err, ctx) => {
    // console.log('🚀 ~ err:', err);
  });
};

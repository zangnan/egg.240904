module.exports = options => {
  return async function jwtErr(ctx, next) {
    const token = ctx.request.header.accesstoken;
    // console.info('token ====================================');
    // console.info(ctx.app.config.authorization.enable);
    // console.info(ctx.request.header);
    // console.info(token);

    // 排除不需要认证的路由
    // const ignorePaths = [ '/swagger-ui.html', '/swagger-doc' ];
    // console.info('************************ ');
    // console.info(ctx.request.header.referer);
    if ((ctx?.request?.header?.referer || '').includes('/swagger-ui.html')) {
      await next();
      return;
    }

    const method = ctx.method.toLowerCase();
    if (!ctx.app.config.authorization.enable) {
      await next();
    } else if (method === 'get') {
      await next();
    } else if (!token) {
      ctx.throw(401, '未登录（token不存在），请先登录');
    } else {
      let decode = '';
      try {
        // 解码token
        decode = ctx.app.jwt.verify(token, options.secret);// 验证token
        // console.info('decode =======', decode);
        await next();
      } catch (error) {
        // console.info('token catch error ######################');
        // console.info(error);
        ctx.status = 401;
        ctx.body = {
          message: error.message,
        };
        return;
      }
    }
  };
};

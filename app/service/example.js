'use strict';

const Service = require('egg').Service;

class ExampleService extends Service {
  // constructor(ctx) {
  //   super(ctx);
  // }

  // 表单查询
  async show(params) {
    const { uuid } = params;
    const result = await this.app.mysql.get('user', { uuid });
    // this.checkSuccess(result);
    return result;
  }

  // 列表查询
  async list(params) {
    const { pageSize = 5, page = 1 } = params;
    const results = await this.app.mysql.select('user', { // 搜索 user 表
      limit: Number(pageSize), // 返回数据量
      offset: Number(pageSize) * (Number(page) - 1), // 数据偏移量
    });
    // this.checkSuccess(result);
    return results;
  }

  // 新增
  async create(params) {
    const result = await this.app.mysql.insert('user', {
      ...params,
      create_time: this.app.mysql.literals.now,
    });
    const insertSuccess = result.affectedRows === 1;
    // this.checkSuccess(result);
    return insertSuccess;
  }

  // 更新
  async update(params) {
    const { uuid } = params;
    const options = {
      where: { uuid },
    };
    const result = await this.app.mysql.update('user', params, options);
    const updateSuccess = result.affectedRows === 1;
    // this.checkSuccess(result);
    return updateSuccess;
  }

  // 删除
  async delete(params) {
    const { uuid } = params;
    const result = await this.app.mysql.delete('user', { uuid });
    // this.checkSuccess(result);
    return result;
  }

  checkSuccess(result) {
    if (result.status !== 200) {
      const errorMsg = result.data && result.data.error_msg ? result.data.error_msg : 'unknown error';
      this.ctx.throw(result.status, errorMsg);
    }
    if (!result.data.success) {
      this.ctx.throw(500, 'remote response error', { data: result.data });
    }
  }

  // 测试用例
  async test01() {
    const { ctx } = this;
    // 测试 定时任务
    console.info(ctx.app.myCityCache);
    // 测试 extend app
    console.info('ctx.app.bar =', ctx.app.bar);
    // 测试 extend ctx
    console.info('ctx.bar =', ctx.bar);
    // 测试 extend request
    console.info('ctx.request.foo =', ctx.request.foo);
    // 测试 extend response
    ctx.response.foo = 'ctx.response.foo.value';
    // 测试 extend helper
    console.info(ctx.helper.relativeTime(1611653194));
    // 测试 log
    ctx.logger.debug('测试 log debug info');
    ctx.logger.info('测试 log some request data: %j', ctx.request.foo);
    ctx.logger.warn('测试 log WARNNING!!!!');
    ctx.logger.error(new Error('测试 log whoops')); // 必须保证所有抛出的异常都是 Error 类型
  }
}

module.exports = ExampleService;

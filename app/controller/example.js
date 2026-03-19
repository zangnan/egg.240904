const Controller = require('egg').Controller;

class ExampleController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.createRule = {
      name: { type: 'string', max: 30, required: false },
      sex: { type: 'enum', values: [ '0', '1', '2' ], required: false },
      email: { type: 'email', allowEmpty: true },
    };
  }

  // 表单查询
  async show() {
    const { ctx } = this;
    ctx.body = await ctx.service.example.show(ctx.request.body);
    ctx.status = 200;
  }

  // 列表查询
  async list() {
    const { ctx } = this;
    try {
      ctx.validate({
        pageSize: { type: 'int', required: false },
        page: { type: 'int', required: false },
      }, ctx.request.body);
    } catch (err) {
      ctx.logger.warn(err);
      ctx.body = {
        errors: err.errors,
        success: false,
        msg: '列表查询操作失败',
      };
      return;
    }
    ctx.body = await ctx.service.example.list(ctx.request.body);
    ctx.status = 200;
  }

  // 新增
  async create() {
    const { ctx } = this;
    try {
      ctx.validate(this.createRule);
    } catch (err) {
      ctx.logger.warn(err.errors);
      ctx.body = {
        errors: err.errors,
        success: false,
        msg: '新增操作失败',
      };
      return;
    }
    ctx.body = await ctx.service.example.create(ctx.request.body);
    ctx.status = 200;
  }

  // 更新
  async update() {
    const { ctx } = this;
    try {
      ctx.validate(this.createRule);
    } catch (err) {
      ctx.logger.warn(err.errors);
      ctx.body = {
        errors: err.errors,
        success: false,
        msg: '更新操作失败',
      };
      return;
    }
    const result = await ctx.service.example.update(ctx.request.body);
    ctx.body = result;
    ctx.status = 200;
  }

  // 删除
  async delete() {
    const { ctx } = this;
    const result = await ctx.service.example.delete(ctx.request.body);
    ctx.body = result;
    ctx.status = 200;
  }

  // 测试用例test01
  async test01() {
    const { ctx } = this;
    await ctx.service.example.test01();
    // Query String 方式
    console.info('${ctx.query.myname}', `${ctx.query.myname}`);
    // 设置响应头
    ctx.set('key123', 'value12311');
  }

  // 测试用例test02
  async test02() {
    const { ctx } = this;
    // 参数命名方式
    console.info('${ctx.params.id} = ', `${ctx.params.id}`, ' ${ctx.params.name} = ', `${ctx.params.name}`);
    // 表单内容的获取
    ctx.body = `body: ${JSON.stringify(ctx.request.body)}`;
  }

  // 测试用例test03
  async test03() {
    const { ctx } = this;
    // 复杂参数的获取
    console.info(`package:${ctx.params[0]}`);
  }
}

module.exports = ExampleController;

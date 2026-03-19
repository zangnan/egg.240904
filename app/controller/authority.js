'use strict';
const BaseController = require('./sdp');
const { handleErrorCommon } = require('../extend/errorUtil');

/**
 * @Controller Authority 登录、权限
 */
class Authority extends BaseController {
  constructor(ctx) {
    super(ctx);
    this.createRule = {};
  }

  /**
 * @summary 用户角色设置
 * @description 用户角色设置
 * @router post /ns/base/authority/setUserRole
 * @request body setUserRoleRequest
 * @response 200 baseResponse 查询成功
 */
  async setUserRole() {
    const { ctx } = this;
    ctx.validate(ctx.rule.setUserRoleRequest);
    try {
      ctx.body = await ctx.service.baseService.setUserRole(ctx.request.body);
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900260', err);
    }
  }

  /**
   * @summary 角色菜单设置
   * @description 角色菜单设置
   * @router post /ns/base/role/saveRoleMenu
   * @request body saveRoleMenuRequest
   * @response 200 baseResponse 查询成功
   */
  async saveRoleMenu() {
    const { ctx } = this;
    ctx.validate(ctx.rule.saveRoleMenuRequest);
    try {
      ctx.body = await ctx.service.baseService.saveRoleMenu(ctx.request.body);
      ctx.status = 200;
    } catch (err) {
      handleErrorCommon(ctx, 'E900270', err);
    }
  }

  /**
   * @summary 获取登录用户token
   * @description 获取登录用户token
   * @router post /dict/security/login
   * @request body getTokenRequest
   * @response 200 baseResponse 查询成功
   * @apikey
   */
  async getToken() {
    const { ctx } = this;
    ctx.validate(ctx.rule.getTokenRequest);
    // ctx.validate({
    //   // name: { type: 'string', max: 30, required: true }, // 内置校验规则
    //   name: { type: 'admin' }, // 自定义校验规则
    //   password: { type: 'string', min: 6, max: 30, required: true },
    // }, ctx.request.body);
    ctx.body = await ctx.service.ddit.user.getToken(ctx.request.body);
    ctx.status = 200;
  }

  /**
   * @summary 获取登录用户信息
   * @description 获取登录用户信息
   * @router post /dict/login/getLoginUserInfo
   * @response 200 baseResponse 创建成功
   * @apikey
   */
  async getUser() {
    const { ctx } = this;
    // ctx.validate(ctx.rule.setUserRoleRequest);
    const user = await ctx.service.ddit.user.getUser();
    ctx.body = user;
    ctx.status = 200;
  }

  // 设置用户信息
  async setting() {
    const { ctx } = this;
    ctx.body = await ctx.service.ddit.user.setting();
    ctx.status = 200;
  }

  // 获取用户头像
  async getAvatarBlob() {
    const { ctx } = this;
    ctx.body = await ctx.service.ddit.user.getAvatarBlob();
    ctx.status = 200;
  }
}

module.exports = Authority;

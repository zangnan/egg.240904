// 自定义异常基类，携带异常信息、名称、异常码与堆栈
class AppError extends Error {
  /**
   * @param {string} message - 异常信息
   * @param {string} name - 异常名称
   * @param {number|string} errorCode - 异常码
   * @param {Error} [cause] - 原始错误（可选，用于错误链）
   */
  constructor(message, name, errorCode, cause) {
    super(message);
    this.name = name;
    this.errorCode = errorCode;
    this.cause = cause;

    // 保留调用栈，且不包含当前构造函数的堆栈帧，便于定位
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * 获取结构化错误信息（便于日志上报或接口返回）
   * @return {{name: string, message: string, errorCode: number|string, stack: string, cause: Error|undefined}}
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      stack: this.stack,
      cause: this.cause,
    };
  }

  /**
   * 便捷打印：控制台输出格式化的异常摘要
   */
  print() {
    console.error(`[${this.name}] ${this.errorCode}: ${this.message}`);
    console.error(this.stack);
    if (this.cause) {
      console.error('Caused by:', this.cause);
    }
  }
}

// 业务示例：参数校验异常
class BaseServiceError extends AppError {
  constructor(message, field, errorCode) {
    super(message, 'baseService', errorCode);
    this.field = field;
  }
}
// 业务示例：参数校验异常
class ValidationError extends AppError {
  constructor(message, field, errorCode = 'VALIDATION_ERROR') {
    super(message, 'ValidationError', errorCode);
    this.field = field;
  }
}

// 业务示例：资源未找到异常
class NotFoundError extends AppError {
  constructor(resource, id, errorCode = 'NOT_FOUND') {
    super(`${resource} not found: ${id}`, 'NotFoundError', errorCode);
  }
}

const handleErrorCommon = (ctx, code, err = {}) => {
  let errorCode;
  let cause;
  if (err instanceof AppError) {
    errorCode = err.errorCode;
    cause = err.cause;
  } else {
    errorCode = code;
    err.errorCode = errorCode;
    cause = err;
  }
  ctx.logger.error(err, { ctx });
  ctx.body = {
    code: errorCode,
    msg: err.message,
    err: cause.stack,
  };
  ctx.status = 200;
};

// module.exports = AppError;
module.exports = { AppError, BaseServiceError, ValidationError, NotFoundError, handleErrorCommon };

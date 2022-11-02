const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const jwt = require("jsonwebtoken");
const koajwt = require("koa-jwt");
const SECRET = "6A986D5E99EE6E80AE9AA36BB348F30B"; // 秘钥



const index = require('./routes/index')
const users = require('./routes/users')
const loci = require('./routes/loci')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))



logger
app.use(async (ctx, next) => {
  console.log(ctx.headers, '======================HEADERS=======================');
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})




// // 自定义的权限错误处理, 当然这是特殊的业务需求
async function customAuthorizationCatcher(ctx, next) {
  try {
    await next();
  } catch (err) {
    // 由 koa-jwt 抛出的错误
    console.log(err);
    if (err.status === 401) {
      // 强制修改网络状态, 在接口中返回业务类型状态码(根据需求)
      ctx.status = 200;
      ctx.body = { code: 40100, msg: "无效 token" };
    } else {
      throw err;
    }
  }
}
app.use(customAuthorizationCatcher); // 这个中间件要放在'koa-jwt'的前面

// app.use(function (ctx, next) {
//   return next().catch((err) => {
//     if (401 == err.status) {
//       ctx.status = 401;
//       ctx.body = 'Protected resource, use Authorization header to get access\n';
//     } else {
//       throw err;
//     }
//   });
// });




// koa-jwt 中间件会获取前端请求中的token,进行检验
app.use(
  koajwt({
    secret: SECRET,
    // key: "user", 默认把token解析的内容保存到 'ctx.user' 中
  }).unless({
    path: [
      /^\/users/
    ]
  }
  )
);


// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(loci.routes(), loci.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app

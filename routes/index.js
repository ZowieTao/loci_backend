const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  await ctx.render('index', { // render是读取模板文件渲染
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'

})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json',
    code: 200
  }
})

module.exports = router
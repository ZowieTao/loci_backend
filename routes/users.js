const router = require('koa-router')()
const userService = require('../controllers/mySqlConfig')
const jwt = require("jsonwebtoken");
const SECRET = "6A986D5E99EE6E80AE9AA36BB348F30B"; // 秘钥

router.prefix('/users') //前缀


// 定义登录的接口
router.post('/userLogin', async (ctx, next) => {
  //拿到前端给我的参数,去数据库里面匹配 //post请求一定要body
  let _username = ctx.request.body.username
  let _userpwd = ctx.request.body.userpwd
  // console.log(_username, _userpwd)
  //匹配
  await userService.userLogin(_username, _userpwd).then(res => {
    console.log(res, 'login<===========');
    let xx = res[0].uid + ''
    let id = ['0'.repeat(5 - xx.length), ...xx].join('')
    const token = jwt.sign({ id }, SECRET);
    console.log(token);
    let r = '';
    if (res.length) {
      r = 'success'
      let result = {
        id: res[0].uid,
        nickname: res[0].nickname,
        username: res[0].username,
        createTime: res[0].createTime
      }
      ctx.body = {
        code: 200,
        data: result,
        mess: '登录成功',
        token: token
      }
    } else {
      r = 'error'
      ctx.body = {
        code: '80004',
        data: r,
        mess: '账号或密码错误'
      }
    }
  }).catch(err => {
    console.log(err, '=======================================================');
    ctx.body = {
      code: '80002',
      data: err,
      mess: '登录失败'
    }
  })
})

router.post('/userRegister', async (ctx, next) => {
  // 根据用户名生成 token (其实应该还有 password, 这里忽略了)
  let _username = ctx.request.body.username
  let _userpwd = ctx.request.body.userpwd
  let _nickname = ctx.request.body.username
  // console.log(_username, _userpwd, _nickname)
  if (!_username || !_userpwd) {
    ctx.body = {
      code: '80001',
      mess: '账户或密码不能为空'
    }
  }
  //判断当前前端传过来的username是否已经注册过
  await userService.findUser(_username).then(async (res) => {
    console.log(res);
    let r = ''
    if (res.length) {
      ctx.body = {
        code: '80003',
        mess: '账号已存在'
      }
    } else {
      await userService.insertUser([_username, _nickname, _userpwd]).then(res => {
        let xx = res.insertId + ''
        let id = ['0'.repeat(5 - xx.length), ...xx].join('')
        const token = jwt.sign({ id }, SECRET);
        if (res.affectedRows !== 0) {
          r = 'ok'
          ctx.body = {
            token,
            code: 200,
            data: r,
            mess: '注册成功'
          }
        } else {
          r = 'error'
          ctx.body = {
            code: '80001',
            data: r,
            mess: '注册失败'
          }
        }
      })
    }
  }).catch(err => {
    ctx.body = {
      code: '80002',
      data: err
    }
  })
})




router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

module.exports = router

const router = require('koa-router')()
const userService = require('../controllers/mySqlConfig')


router.prefix('/loci') //前缀

// 定义loci的接口

router.post('/getClass', async (ctx, next) => {
  console.log(ctx);
  let uid = ctx.request.body.uid
  await userService.getClass(uid).then(res => {
    if (res.length != 0) {
      console.log(uid, '用户获取分类');
      r = 'ok'
      ctx.body = {
        code: 200,
        data: r,
        class: res,
        mess: '获取分类成功'
      }
    } else {
      r = 'error'
      ctx.body = {
        code: '80001',
        data: r,
        mess: `请添加分类`
      }
    }
  })
})

router.post('/postLoci', async (ctx, next) => {
  if (ctx.request.body.lociCode == 1) { // 插入内容形loci
    // console.log(ctx.request.body);
    let { uid, sortSelected, title, keyWords, text } = ctx.request.body
    // console.log('loci_content', sortSelected, title, keyWords, text);
    await userService.postLoci([uid, 'loci_content', sortSelected[1], title, keyWords, text]).then(res => {
      console.log(res);
      if (res.affectedRows !== 0) {
        r = 'ok'
        ctx.body = {
          code: 200,
          data: r,
          mess: '上传loci成功'
        }
      } else {
        r = 'error'
        ctx.body = {
          code: '80001',
          data: r,
          mess: '上传loci失败'
        }
      }
    }).catch(err => {
      ctx.body = {
        code: '80002',
        data: err
      }
    })
  }
  if (ctx.request.body.lociCode == 2) {
    console.log(ctx.request.body);
    let { uid, sortSelected, title, vocabularies } = ctx.request.body
    await userService.postLoci([uid, 'loci_vocabularies', sortSelected, title, vocabularies]).then(res => {
      console.log(res);
      if (res.affectedRows !== 0) {
        r = 'ok'
        ctx.body = {
          code: 200,
          data: r,
          mess: '上传loci成功'
        }
      } else {
        r = 'error'
        ctx.body = {
          code: '80001',
          data: r,
          mess: '上传loci失败'
        }
      }
    }).catch(err => {
      ctx.body = {
        code: '80002',
        data: err
      }
    })
  }
  if (ctx.request.body.lociCode == 3) {  // 插入问题形式loci
    // console.log(ctx.request.body);
    // uid: '00001',
    // lociCode: 3,
    // sortSelected: [ '考研专业课', '前端开发浏览器优化篇' ],
    // title: 'Vue 优化',
    // questions: { '技术是开发它的人的共同灵魂': '技术是开发它的人的共同灵魂技术是开发它的人的共同灵魂技术是开发它的人的共同灵魂' }
    let { uid, sortSelected, title, questions } = ctx.request.body
    await userService.postLoci([uid, 'loci_question', sortSelected, title, questions]).then(res => {
      // console.log(res);
      if (res.affectedRows !== 0) {
        r = 'ok'
        ctx.body = {
          code: 200,
          data: r,
          mess: '上传loci成功'
        }
      } else {
        r = 'error'
        ctx.body = {
          code: '80001',
          data: r,
          mess: '上传loci失败'
        }
      }
    }).catch(err => {
      ctx.body = {
        code: '80002',
        data: err
      }
    })

  }
  if (ctx.request.body.lociCode == 4) {
    let { uid, sortSelected, title, completions } = ctx.request.body
    await userService.postLoci([uid, 'loci_completion', sortSelected, title, completions]).then(res => {
      // console.log(res);
      if (res.affectedRows !== 0) {
        r = 'ok'
        ctx.body = {
          code: 200,
          data: r,
          mess: '上传loci成功'
        }
      } else {
        r = 'error'
        ctx.body = {
          code: '80001',
          data: r,
          mess: '上传loci失败'
        }
      }
    }).catch(err => {
      ctx.body = {
        code: '80002',
        data: err
      }
    })

  }

})

router.post('/getLociBasic', async (ctx, next) => {
  //拿到前端首页给我的参数,去数据库里面匹配 //post请求一定要body
  // 在这当中前端传来用户的id，通过获取id从数据库中拉去所有的loci并
  await userService.getlociBasic(ctx.request.body.uid).then(res => {
    // console.log(res);
    if (res.length) {
      ctx.body = {
        code: 200,
        data: res,
        mess: '获取成功'
      }
    } else {
      r = 'error'
      ctx.body = {
        code: '000000',
        data: 'error',
        mess: '未获取到分类'
      }
    }
  }).catch(err => {
    ctx.body = {
      code: '000000',
      data: err
    }
  })
})

router.post('/getLoci', async (ctx, next) => {
  await userService.getLoci(ctx.request.body.loci_id).then(res => {
    if (res.length) {
      ctx.body = {
        code: 200,
        data: res,
        mess: '获取成功'
      }
    } else {
      r = 'error'
      ctx.body = {
        code: '000000000000',
        data: 'error',
        mess: '获取失败'
      }
    }
  }).catch(err => {
    ctx.body = {
      code: '000000000000',
      data: err
    }
  })
})

router.post('/reviewFinsih', async (ctx, next) => {
  let { loci_id, round, uid } = ctx.request.body
  await userService.reviewFinsih([uid, loci_id, round])
    .then(res => {
      if (res.affectedRows == 1) {
        ctx.body = {
          code: 200,
          res: res,
          mess: res.message
        }
      } else {
        r = 'error'
        ctx.body = {
          code: '000000',
          res: res,
          mess: '后台复习进度更新失败'
        }
      }
    })
    .catch(err => {
      ctx.body = {
        code: '000000',
        data: err
      }
    })
})

router.post('/lociModify', async (ctx, next) => {
  let { uid, _sql } = ctx.request.body

  // console.log(uid, _sql);
  await userService.lociModify(uid, _sql)
    .then(res => {
      if (res.affectedRows == 1) {
        ctx.body = {
          code: 200,
          res: res,
          mess: res.message
        }
      } else {
        r = 'error'
        ctx.body = {
          code: '000000000000',
          res: res,
          mess: '更新失败'
        }
      }
    })
    .catch(err => {
      ctx.body = {
        code: '000000000000',
        data: err
      }
    })
})

router.post('/deleLoci', async (ctx, next) => {
  let { uid, loci_id } = ctx.request.body
  await userService.deleLoci(uid, loci_id)
    .then(res => {
      if (res.affectedRows == 1) {
        ctx.body = {
          code: 200,
          res: res,
          mess: 'Loci删除成功'
        }
      } else {
        r = 'error'
        ctx.body = {
          code: '000000',
          res: res,
          mess: '删除失败'
        }
      }
    })
    .catch(err => {
      ctx.body = {
        code: '00000',
        data: err
      }
    })
})

router.post('/sortEdit', async (ctx, next) => {
  let { uid, Sort, sortId, sortClass, action, content } = ctx.request.body
  await userService.sortEdit(Sort, sortId, sortClass, action, content)
    .then(res => {
      if (res.affectedRows == 1) {
        ctx.body = {
          code: 200,
          res: res,
          mess: `分类操作成功`
        }
      } else {
        r = 'error'
        ctx.body = {
          code: '000000',
          res: res,
          mess: '分类操作失败'
        }
      }
    })
    .catch(err => {
      ctx.body = {
        code: '00000',
        data: err,
        mess: '分类操作失败'
      }
    })
})


router.post('/LOCIEdit', async (ctx, next) => {
  // let { uid, content, action } = ctx.request.body
  await userService.LOCIEdit(ctx.request.body)
    .then(res => {
      if (res.affectedRows == 1) {
        ctx.body = {
          code: 200,
          res: res,
          mess: `分类操作成功`
        }
      } else {
        r = 'error'
        ctx.body = {
          code: '000000',
          res: res,
          mess: '分类操作失败'
        }
      }
    })
    .catch(err => {
      ctx.body = {
        code: '00000',
        data: err,
        mess: '分类操作失败'
      }
    })
})
// page, action, sortName, sortId, sortLevel, content, targetLevel 
router.post('/sortEditor', async (ctx, next) => {
  await userService.sortEditor(ctx.request.body)
    .then(res => {
      if (res.affectedRows == 1) {
        ctx.body = {
          code: 200,
          res: res,
          mess: `分类操作成功`
        }
      } else {
        r = 'error'
        ctx.body = {
          code: '000000',
          res: res,
          mess: '分类操作失败'
        }
      }
    })
    .catch(err => {
      ctx.body = {
        code: '00000',
        data: err,
        mess: '分类操作失败'
      }
    })
})
module.exports = router
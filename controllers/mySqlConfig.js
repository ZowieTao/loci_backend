const mysql = require('mysql')
const config = require('./defaultConfig')

// 创建线程池
let pool = mysql.createPool({
  host: config.dataBase.HOST,
  user: config.dataBase.USERNAME,
  password: config.dataBase.PASSWORD,
  database: config.dataBase.DATABASE,
  timezone: '08:00',    //时区配置
  port: config.dataBase.PORT,
})

//连接线程池，做sql查找
let allServices = {
  query: function (sql, values) {
    return new Promise((resolve, reject) => {
      pool.getConnection(function (err, connection) {
        if (err) {
          reject(err)
        } else { //连接成功
          connection.query
            (sql, values, (err, rows) => {  //sql语句的查找
              if (err) {
                reject(err)
              } else {
                resolve(rows)
              }
              connection.release()
            })
        }
      })
    })
  }
}

//用户登录
let userLogin = function (username, userpwd) {
  let _sql = `select * from users where username="${username}" and userpwd="${userpwd}";`
  return allServices.query(_sql)
}

//查找用户
let findUser = function (username) {
  let _sql = `select * from users where username="${username}";`
  return allServices.query(_sql)
}

//用户注册 
let insertUser = function (value) {
  console.log(value);
  let _sql = `INSERT INTO users (username,nickname,userpwd) VALUES ('${value[0]}', '${value[1]}','${value[2]}');`
  return allServices.query(_sql)
}

// 获取分类
let getClass = function (uid) {
  let _sql = `
  select locis.locis_id,locis_name,sub_locis_id,sub_locis_name
  from locis,sub_locis
  where (locis.user_id = '${uid}') and (locis.locis_id = sub_locis.locis_id)
  `
  return allServices.query(_sql)
}

// 上传loci
let postLoci = function (loci) {  // ***** 可以优化重构
  console.log(loci);
  let _sql = ''
  if (loci[1] == 'loci_content') {
    _sql = `
    INSERT INTO ${loci[1]} 
		(user_id,locis_id,sub_locis_id,loci_content_title,loci_content_key,loci_content_main)
    SELECT ${loci[0]},locis_id,sub_locis_id,"${loci[3]}","${loci[4]}",'${loci[5]}'
    FROM sub_locis
    WHERE sub_locis_name = '${loci[2]}';`
  }
  if (loci[1] == 'loci_vocabularies') {   //词汇loci上传
    _sql = `
    INSERT INTO ${loci[1]} 
		(user_id, locis_id, sub_locis_id, loci_vocabularies_title, loci_vocabularies_main )
    SELECT ${loci[0]},locis_id,sub_locis_id,"${loci[3]}",'${JSON.stringify(loci[4])}'
    FROM sub_locis
    WHERE sub_locis_name = '${loci[2][1]}';`
  }
  if (loci[1] == 'loci_question') {
    _sql = `
    INSERT INTO ${loci[1]} 
		(user_id, locis_id, sub_locis_id, loci_question_title, loci_question_main )
    SELECT ${loci[0]},locis_id,sub_locis_id,"${loci[3]}",'${JSON.stringify(loci[4])}'
    FROM sub_locis
    WHERE sub_locis_name = '${loci[2][1]}';`
  }
  if (loci[1] == 'loci_completion') {
    _sql = `
    INSERT INTO ${loci[1]} 
		(user_id, locis_id, sub_locis_id, ${loci[1]}_title, ${loci[1]}_main )
    SELECT ${loci[0]},locis_id,sub_locis_id,"${loci[3]}",'${loci[4]}'
    FROM sub_locis
    WHERE sub_locis_name = '${loci[2][1]}';`
  }
  console.log(_sql, '<=====SQL');
  return allServices.query(_sql)
}

// 获取用户所有loci基本信息
// let getlociBasic
let getlociBasic = function (uid) {  // ***** 后续通过视图优化
  let _sql = `
	(  SELECT locis_name, locis.locis_id,sub_locis.sub_locis_id, sub_locis_name, loci_content_id as 'loci_id', loci_content_title as 'loci_title',  loci_content_round as 'loci_round',  loci_content_time as 'loci_time'
	  FROM locis 
    LEFT JOIN sub_locis ON sub_locis.locis_id = locis.locis_id
    LEFT JOIN loci_content on loci_content.sub_locis_id = sub_locis.sub_locis_id
    WHERE locis.user_id = ${uid}
  )UNION (
  SELECT locis_name, locis.locis_id,sub_locis.sub_locis_id,sub_locis_name,loci_vocabularies_id as 'loci_id',loci_vocabularies_title as 'loci_title', loci_vocabularies_round as 'loci_round', loci_vocabularies_time as 'loci_time'
  FROM locis 
    LEFT JOIN sub_locis ON sub_locis.locis_id = locis.locis_id
    LEFT JOIN loci_vocabularies on loci_vocabularies.sub_locis_id = sub_locis.sub_locis_id
    WHERE locis.user_id = ${uid}
)
  UNION (
    SELECT locis_name, locis.locis_id,sub_locis.sub_locis_id,sub_locis_name,loci_question_id as 'loci_id',loci_question_title as 'loci_title', loci_question_round as 'loci_round', loci_question_time as 'loci_time'
    FROM locis 
    LEFT JOIN sub_locis ON sub_locis.locis_id = locis.locis_id
    LEFT JOIN loci_question on loci_question.sub_locis_id = sub_locis.sub_locis_id
    WHERE locis.user_id = ${uid} 
  )
  UNION (
    SELECT locis_name, locis.locis_id,sub_locis.sub_locis_id,sub_locis_name,loci_completion_id as 'loci_id',loci_completion_title as 'loci_title', loci_completion_round as 'loci_round', loci_completion_time as 'loci_time'
    FROM locis 
    LEFT JOIN sub_locis ON sub_locis.locis_id = locis.locis_id
    LEFT JOIN loci_completion on loci_completion.sub_locis_id = sub_locis.sub_locis_id
    WHERE locis.user_id = ${uid} 
  )
  `
  // SELECT locis_name, sub_locis_name, loci_content_id as 'loci_id', loci_content_title as 'loci_title',  loci_content_round as 'loci_round',  loci_content_time as 'loci_time'
  // FROM sub_locis 
  //   LEFT JOIN loci_content ON loci_content.sub_locis_id = sub_locis.sub_locis_id
  //   LEFT JOIN locis on sub_locis.locis_id = locis.locis_id
  //   WHERE locis.user_id = ${uid} 
  // 多表联合： 用union 不去要去重则union all 性能更好
  /*
    (  SELECT locis_name, sub_locis_name, loci_content_id as 'loci_id', loci_content_title as 'loci_title',  loci_content_round as 'loci_round',  loci_content_time as 'loci_time'
  FROM sub_locis 
    LEFT JOIN loci_content ON loci_content.sub_locis_id = sub_locis.sub_locis_id
    LEFT JOIN locis on sub_locis.locis_id = locis.locis_id
    WHERE locis.user_id = ${uid} 
)UNION all(
SELECT locis_name,sub_locis_name,loci_vocabularies_id as 'loci_id',loci_vocabularies_title as 'loci_title', loci_vocabularies_round as 'loci_round', loci_vocabularies_time as 'loci_time'
FROM sub_locis 
  LEFT JOIN loci_vocabularies ON loci_vocabularies.sub_locis_id = sub_locis.sub_locis_id
  LEFT JOIN locis on sub_locis.locis_id = locis.locis_id
  WHERE locis.user_id =  ${uid} 
  )
  */

  return allServices.query(_sql)
}


let getLoci = function (loci_id) { // 获取loci信息
  let collection = loci_id < 1000 ? 'loci_content' : (loci_id < 2000 ? 'loci_vocabularies' : (loci_id < 3000 ? 'loci_question' : 'loci_completion'))
  let _sql = ` 
  SELECT user_id,${collection}_id,sub_locis_name,${collection}_title ${collection == 'loci_content' ? ',loci_content_key' : ''}, ${collection}_main,${collection}_round,${collection}_time
  FROM 
  ${collection} LEFT JOIN sub_locis on ${collection}.sub_locis_id = sub_locis.sub_locis_id 
  where ${collection}.${collection}_id = ${loci_id}
  `
  console.log(_sql);
  return allServices.query(_sql)
}


let reviewFinsih = function ([uid, loci_id, round]) {
  // console.log('mysqlconfig===>', uid, loci_id, round);
  let collection = loci_id < 1000 ? 'loci_content' : (loci_id < 2000 ? 'loci_vocabularies' : (loci_id < 3000 ? 'loci_question' : 'loci_completion'))
  let _sql = `
  update ${collection} SET ${collection}_time=now() ,${collection}_round = ${round + 1}
  where user_id = ${uid} and ${collection}_id = ${loci_id}
  `
  console.log(_sql, 'reviewFinsh');
  return allServices.query(_sql)
}


let lociModify = function (uid, _sql) {
  return allServices.query(_sql)
}

let deleLoci = function (uid, loci_id) {
  let collection = loci_id < 1000 ? 'loci_content' : (loci_id < 2000 ? 'loci_vocabularies' : (loci_id < 3000 ? 'loci_question' : 'loci_completion'))
  let _sql = `
  DELETE FROM ${collection} WHERE ${collection}_id=${loci_id} AND user_id=${uid};
  `
  return allServices.query(_sql)
}



let LOCIEdit = function (info) {
  let _sql = ``
  let { action, content, LOCIID } = info

  if (action == 'addSub') { // 传过来的是子分类的id 要添加同分类下的兄弟分类
    _sql = `
    insert into sub_locis (locis_id, sub_locis_name) select locis_id,'${content}'as 'sub_locis_name' from sub_locis where sub_locis_id=${LOCIID}
    `
  }
  if (action == 'add') {
    _sql = `
    INSERT INTO locis 
		(user_id, locis_name ) values (${info.uid}, '${info.content}');
    `
  }
  if (action == 'delete') {
    _sql =
      `DELETE FROM ${collection} 
    WHERE ${collection}_name='${Sort}' AND ${collection}_id = ${sortId};`
  }
  if (action == 'modify') {
    _sql =
      `UPDATE ${collection} SET ${collection}_name='${content}' 
    WHERE ${collection}_id = ${sortId}`
  }
  console.log(action, _sql);
  return allServices.query(_sql)
}

let sortEdit = function (Sort, sortId, sortLevel, action, content) {
  let collection = sortLevel == 1 ? 'locis' : 'sub_locis'
  let _sql = action == 'delete' ?
    `DELETE FROM ${collection} 
    WHERE ${collection}_name='${Sort}' AND ${collection}_id = ${sortId};`
    :
    `UPDATE ${collection} SET ${collection}_name='${content}' 
    WHERE ${collection}_id = ${sortId}`
  console.log(action, _sql);
  return allServices.query(_sql)
}

// page, action, sortName, sortId, sortLevel, content, targetLevel 
let sortEditor = function (info) {
  let { action, sortName, sortId, sortLevel, targetLevel, content, uid } = info, _sql = ``
  let collection = targetLevel == 1 ? 'locis' : 'sub_locis'  // 目标分类等级
  console.log(info);
  if (sortLevel == 1) {  // 可获取到的分类等级相关信息
    //  已知传入的为一级分类信息, 可能的操作有： 添加一级分类，添加二级分类，删除一级分类，修改一级分类名称
    if (action == 'add' && collection == 'locis') {
      _sql = `
      INSERT INTO locis 
      (user_id, locis_name ) values (${uid}, '${content}');
      `
    }
    if (action == 'add' && collection == 'sub_locis') {
      _sql = `
      INSERT INTO sub_locis 
      (locis_id, sub_locis_name ) values (${sortId}, '${content}');
      `
    }
    if (action == 'delete') {
      _sql =
        `DELETE FROM ${collection} 
        WHERE ${collection}_name='${sortName}' AND ${collection}_id = ${sortId};`
    }
    if (action == 'modify') {
      _sql =
        `UPDATE ${collection} SET ${collection}_name='${content}' 
      WHERE ${collection}_id = ${sortId}`
    }

  } else { // 传入的分类等级为子分类，增加子分类，修改子分类
    if (collection == 'sub_locis') { // 传入子分类信息，操作子分类的删除和改动
      if (action == 'delete') {
        _sql = `DELETE FROM ${collection} 
      WHERE ${collection}_name='${sortName}' AND ${collection}_id = ${sortId};`
      }
      if (action == 'modify') {
        _sql = `UPDATE ${collection} SET ${collection}_name='${content}' 
        WHERE ${collection}_id = ${sortId}`
      }
      if (action == 'add') { // 自身是子分类，又要添加子分类，在myLociWorld中会调用
        _sql = `
        insert into sub_locis (locis_id, sub_locis_name) select locis_id,'${content}'as 'sub_locis_name' from sub_locis where sub_locis_id=${sortId}
        `
      }
    }
  }
  console.log(_sql, '<===========================================================SQL');
  return allServices.query(_sql)
}

module.exports = {
  userLogin,
  findUser,
  insertUser,
  getClass,
  postLoci,
  getlociBasic,
  getLoci,
  reviewFinsih,
  lociModify,
  deleLoci,
  sortEdit,
  LOCIEdit,
  sortEditor
}
# 状态码：
200 ：成功
80004： 账号或密码错误
80002： err
小程序后端

koa脚手架

npm i koa-generator -g

koa2 server -e -ejs  //起脚手架

npm i  安装依赖

前端完成登录页面样式及登录请求

将向后端请求的操作封装到util的request 

后端的controllers中用defaultconfig来配置数据库等一些默认配置

在mysqlconfig中连接线程池， 安装npm i mysql
并且添加Login的查询操作再导出，在router users中引入方法，进行登录操作

将前后端联系起来后再完善前端的一些样式 使用vant-weapp 
npm i @vant/weapp -S --production



配置路由user.js




后端连接数据库

写接口（api）
 
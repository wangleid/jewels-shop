//引入模块
const express = require("express");
//引入上一级目录下的mysql连接池对象
const pool = require("../pool.js");

//创建空路由器
let router = express.Router();
//挂载路由
//===============================================
//1.注册用户 POST /register
router.post("/register", (req, res) => {
  //console.log( req.body );
  //1.1获取post请求的数据
  let user = req.body;
  //1.2验证各项数据是否为空
  if (!user.uname) {
    res.send({ code: 401, msg: "uname required" });
    return;  //阻止继续往后执行
  } else if (!user.upwd) {
    res.send({ code: 402, msg: "upwd required" });
    return;
  } else if (!user.email) {
    res.send({ code: 403, msg: "email required" });
    return;
  } else if (!user.phone) {
    res.send({ code: 404, msg: "phone required" });
    return;
  }
  //1.3执行SQL语句,将注册的数据插入到xz_user数据表中
  let sql = "INSERT INTO ss_user SET ?";
  pool.query(sql, [user], (err, result) => {
    //console.log(err);
    if (err) {
      res.send({ code: 201, msg: `register failed", err: ${err}` }); //throw err;
      return;
    }
    //如果数据插入成功，响应对象
    if (result.affectedRows > 0) {
      res.send({ code: 200, msg: "register success" });
    }
  });
});
//===============================================
//2.登录用户 POST /login
router.post("/login", (req, res) => {
  //1.1获取数据
  let user = req.body;
  //1.2验证各项数据是否为空
  if (!user.uname) {
    res.send({ code: 401, msg: "uname required" });
    return;
  } else if (!user.upwd) {
    res.send({ code: 402, msg: "upwd required" });
    return;
  }

  //1.3执行SQL语句,查看是否登录成功（使用用户名和密码两个条件能查询到数据）
  let sql = "SELECT * FROM ss_user WHERE uname = ? AND upwd = ?";
  pool.query(sql, [user.uname, user.upwd], (err, result) => {
    if (err) throw err;
    //判断查询的结果（数组）长度是否大于0,如果大于0，说明查询到数据，有这个用户登录成功
    if (result.length > 0) {
    //登陆成功后将用户uname和uid保存在session中
      req.session.loginUname=user.uname;
      req.session.loginUid=result[0].uid;
      // //登陆成功后将用户和密码写入Cookie，maxAge为cookie过期时间
      // //res.cookie("user",{"uname":user.uname,"upwd":user.upwd},{maxAge:1000*60*60,httpOnly:true});
      // res.cookie("uname","dingding",{maxAge:260*60});
      // //服务器端session保存登陆的会话状态
      // //req.session.user=user.uname;
      //console.log(req.session)

      res.send({ code: 200, msg: "login success" });
    } else {
      res.send({ code: 301, msg: "login failed：uname or upwd is error" });
    }
  });
});

//3.检索用户 GET /detail
router.get("/detail", (req, res) => {
  //1.1获取get请求的数据
  let user = req.query;
  //1.2验证各项数据是否为空
  if (!user.uid) {
    res.send({ code: 401, msg: "uid required" });
    return;
  }

  //1.3执行SQL语句
  let sql = "SELECT uid,uname,email,phone FROM ss_user WHERE uid=?";
  pool.query(sql, [user.uid], (err, result) => {
    if (err) throw err;

    //如果数据查询成功，响应对象
    if (result.length > 0) {
      res.send({
        code: 200,
        msg: "ok",
        data: result[0],
      });
    } else {
      res.send({
        code: 301,
        msg: "can not found",
        data: {},
      });
    }
  });
});
//===============================================
//4.修改用户 POST /update
router.post("/update", (req, res) => {
  //console.log( req.body );
  //1.1获取数据
  let user = req.body;
  //1.2验证各项数据是否为空
  let codeno = 400;
  for (const key in user) {
    codeno++;
    if (!user[key]) {
      res.send({ code: codeno, msg: `${key} required` });
      return;
    }
  }

  //1.3执行SQL语句 ，修改用户表中对应的数据
  let sql = "UPDATE ss_user SET ? WHERE uid=?";
  pool.query(sql, [user, user.uid], (err, result) => {
    if (err)
      res.send({
        code: 201,
        msg: `update failed, err: ${err}`,
      }); //throw err;

    //如果数据更改成功，响应对象
    if (result.affectedRows > 0) {
      res.send({
        code: 200,
        msg: "update success",
        data: user,
      });
    } else {
      res.send({
        code: 301,
        msg: "update error",
        data: user,
      });
    }
  });
});
//===============================================
//5.用户列表 GET /list
router.get("/list", (req, res) => {
  console.log(req.query);
  //1.1获取数据
  //1.2如果页码pno为空 默认为1 如果pageSize大小为空默认是2  要保证pageSize大小为整数
  //处理页码
  let pno = parseInt(req.query.pno);
  pno = pno ? pno :1;
  //处理每页大小
  let pageSize = parseInt(req.query.pageSize);
  pageSize = pageSize ? pageSize :2;
  //
  // 4计算开始查询的值start
  let start = (pno - 1) * pageSize;

  //1.3执行2个SQL语句
  let sql = "SELECT count(*) as Count FROM ss_user; SELECT * FROM ss_user ORDER BY uid DESC LIMIT ?,? ";
  pool.query(sql, [start, pageSize], (err, result) => {
    if (err)
      res.send({
        code: 301,
        msg: `list failed, err: ${err}`,
      }); //throw err;

    let count = result[0][0]['Count'];//获取记录总数，第1个SQL执行结果
    let pageCount = Math.floor(count/pageSize) + 1;  //计算总页数
    //如果数据获取成功（记录数量是0也是一种成功），响应对象
    res.send({
      code: 200,
      msg: "list ok",
      recordCount: result[1].length, //第2个SQL执行结果的行数
      pageSize:pageSize,//每页大小
      pageCount:pageCount,//总页数
      data: result[1],//第2个SQL执行结果
    });
  });
});

//===============================================
//6.删除用户 GET /delete
router.get("/delete", (req, res) => {
  console.log(req.query);
  //1.1获取数据
  let user = req.query;
  //1.2验证数据
  if(!user.uid){
    res.send({ code: 401, msg: "uid required" });
    return;
  }
  //1.3执行SQL语句，删除对应的数据
  let sql = "DELETE FROM ss_user WHERE uid =?";
  pool.query(sql, [user.uid], (err, result) => {
    if (err)
      res.send({
        code: 301,
        msg: `delete failed, err: ${err}`,
      }); //throw err;

    console.log(result);
    //数据库操作影响的记录行数，判断是否删除成功
    if(result.affectedRows>0){
      res.send({
        code: 200,
        msg: `delete success ：uid=${user.uid}`,
      })
    }else{
      res.send({
        code: 301,
        msg: `delete error ： uid=${user.uid}`,
      })
    }
  })
});

//===============================================
//7.检测邮箱 (是否存在这样的邮箱）GET /checkemail
router.get("/checkemail", (req, res) => {
  console.log(req.query);
  //1.1获取数据
  let user = req.query;
  //1.2验证数据
  if(!user.email){
    res.send({ code: 401, msg: "email required" });
    return;
  }
  //1.3执行SQL语句
  let sql = "SELECT 1 FROM ss_user WHERE email =?";
  pool.query(sql, [user.email], (err, result) => {
    if (err){
      res.send({code: 301,msg: `select failed, err: ${err}`}); //throw err;
      return;
    }

    //数据库操作影响的记录行数
    if(result.length>0){
      res.send({
        code: 201,
        msg: `email exists  email=${user.email}`,
      })
    }else{
      res.send({
        code: 200,
        msg: `checkemail ok email=${user.email}`,
      })
    }
  })
});

//===============================================
//8.检测手机 (是否存在这样的手机）GET /checkphone
router.get("/checkphone", (req, res) => {
  console.log(req.query);
  //1.1获取数据
  let user = req.query;
  //1.2验证数据
  if(!user.phone){
    res.send({ code: 401, msg: "phone required" });
    return;
  }
  //1.3执行SQL语句
  let sql = "SELECT 1 FROM ss_user WHERE phone =?";
  pool.query(sql, [user.phone], (err, result) => {
    if (err){
      res.send({code: 301,msg: `select failed, err: ${err}`}); //throw err;
      return;
    }

    //数据库操作影响的记录行数
    if(result.length>0){
      res.send({
        code: 201,
        msg: `phone exists  phone=${user.phone}`
      })
    }else{
      res.send({
        code: 200,
        msg: `checkphone ok phone=${user.phone}`
      })
    }
  })
});

//===============================================
//9.检测用户名 (是否存在这样的用户名）GET /checkuname
router.get("/checkuname", (req, res) => {
  console.log(req.query);
  //1.1获取数据
  let user = req.query;
  //1.2验证数据
  if(!user.uname){
    res.send({ code: 401, msg: "uname required" });
    return;
  }
  //1.3执行SQL语句
  let sql = "SELECT 1 FROM ss_user WHERE uname =?";
  pool.query(sql, [user.uname], (err, result) => {
    if (err){
      // throw err;
      res.send({code: 301,msg: `select failed, errMessage: ${err}`});
      return;
    }
    //console.log(result);
    //数据库操作影响的记录行数
    if(result.length>0){
      res.send({
        code: 201,
        msg: `uname exists  phone=${user.uname}`
      })
    }else{
      res.send({
        code: 200,
        msg: `checkuname ok uname=${user.uname}`
      })
    }
  })
});

//===============================================
//10.退出登录 GET /logout
router.get("/logout", (req, res) => {
   req.session.destroy();
   res.send({ code: 200, msg: "logout success" });
});

//===============================================
//11.获取当前用户信息接口 GET /sessiondata
router.get("/sessiondata", (req, res) => {
   res.send({
    "code": 200,
    "msg": "success",
    "data":{
        "uid":req.session.loginUid,
        "uname":req.session.loginUname
    }
  });
});


//===============================================
//导出路由器
module.exports = router;
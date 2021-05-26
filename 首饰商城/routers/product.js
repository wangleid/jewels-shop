//引入模块
const express = require("express");
//引入连接池
const pool = require("../pool.js");
const query = require("../query");
//创建空路由器
let router = express.Router();
//挂载路由

//1.商品列表 GET /list
router.get("/list", (req, res) => {

  if (!req.session.loginUid) {
    res.send({ code: 300, msg: "login required" });
    return;
  }

  //1.1获取数据
  let kw = req.query.kw || "";
  //"mac i5 128g"
  let kws = kw.split(" ");
  //[mac,i5,128g]
  kws.forEach((elem, i, arr) => {
    arr[i] = `title like '%${elem}%'`;
  });

  //join(" and ");
  let where = kws.join(" and ");
  //console.log(where)
  //1.2如果页码pno为空 默认为1 如果pageSize大小为空默认是9
  //验证页码
  let pno = parseInt(req.query.pno);
  pno = pno ? pno : 1;
  //验证每页大小
  let pageSize = parseInt(req.query.pageSize);
  pageSize = pageSize ? pageSize : 9;
  //1.3计算开始查询的值start
  let start = (pno - 1) * pageSize;

  //console.log(req.session)

  //1.4执行SQL语句 

  let sql = `SELECT count(*) as count FROM ss_product WHERE ${where};
      SELECT lid,title,price,sold_count,is_onsale,(SELECT md FROM ss_pic WHERE k_id = lid limit 1) as pic FROM ss_product WHERE ${where} LIMIT ?,?`;
  //执行SQL语句，响应查询到的数据
  pool.query(sql, [start, pageSize], (err, result) => {
    if (err) {
      res.send({ code: 301, msg: `list failed, errMessage: ${err}` }); //throw err;
      return;
    }
    let recordCount = result[0][0]["count"]; //获取记录总数，第1个SQL语句的执行结果
    let pageCount = Math.floor(recordCount / pageSize) + 1; //计算总页数
    //如果数据获取成功（记录数量是0也是一种成功），响应对象
    let retJson={
        code: 200,
        msg: "list ok",
        recordCount:recordCount,
        pageSize:pageSize,
        pageCount:pageCount,
        pno:pno,
        data:result[1],//第2个SQL语句的执行结果
    };



    res.send(retJson);
  });
});

//2.商品详情 GET /detail
router.get("/detail", (req, res) => {
  let lid = req.query.lid;
  let retJson = {};
  let sql = "SELECT * FROM `ss_product` WHERE lid=?";
  query(sql, [lid])
    .then((result) => {
      retJson.product = result[0];
      let fid = retJson.product.family_id;
      let sql = "SELECT spec,lid FROM `ss_product` where family_id=?";
      //要想继续用then，必须返回Promise对象
      return query(sql, [fid]); //return Promise
    })
    .then((result) => {
      retJson.specs = result;
      let sql = "SELECT * FROM `ss_pic` where k_id=?";
      return query(sql, [lid]);
    })
    .then((result) => {
      retJson.pics = result;
      res.send(retJson);
    })
    //err(error)->catch(error=>{...})
    .catch((error) => console.log(error));
});

//
router.get("/detail2", (req, res) => {
  //1.1获取数据
  let product = req.query;
  //1.2验证各项数据是否为空
  if (!product.lid) {
    res.send({ code: 401, msg: "lid required" });
    return;
  }

  //1.3执行4个SQL语句，把查询的数据响应给浏览器
  let sql = `SELECT * FROM ss_product WHERE lid=?;
             SELECT pid,k_id,sm,md,lg FROM ss_pic WHERE k_id=?;
             SELECT fid,fname FROM ss_family INNER JOIN ss_product ss_family.fid = ss_product.family_id WHERE ss_product.lid = ?;
             SELECT lid,spec FROM ss_product WHERE family_id IN (SELECT family_id FROM ss_product WHERE lid = ?); `;
  pool.query(
    sql,
    [product.lid, product.lid, product.lid, product.lid],
    (err, results) => {
      //出错返回
      if (err) {
        res.send({ code: 301, msg: `list failed, errMessage: ${err}` }); //throw err;
        return;
      }
      //如果数据查询成功，按要求组装成JSON对象
      let objJson = results[0][0]; //第1个SQL语句的返回结果的第1条记录（也只有1条记录）
      if (objJson) {
        objJson["picList"] = results[1]; //第2个SQL语句的返回结果
        let family = results[2][0]; //第3个SQL语句的返回结果的第一条记录（也只有1条记录）
        objJson["family"] = family;
        if (objJson["family"]) objJson["family"]["laptopList"] = results[3]; //第4个SQL语句的返回结果
      }
      res.send({ code: 200, msg: "ok", details: objJson });
    }
  );
});


//3.删除商品 GET /delete   http://127.0.0.1:8080/product/delete?lid=1
router.get("/delete", (req, res) => {
  //1.1获取数据
  let product = req.query;
  //1.2验证数据
  if (!product.lid) {
    res.send({ code: 401, msg: "lid required" });
    return;
  }
  //1.3执行SQL语句
  let sql = "DELETE FROM ss_product WHERE lid =?";
  pool.query(sql, [product.lid], (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: `delete failed, errMessage: ${err.sqlMessage}`,
      }); //throw err;
      return;
    }

    //判断数据库操作影响的记录行数
    if (result.affectedRows > 0) {
      res.send({ code: 200, msg: `delete success ：lid=${product.lid}` });
    } else {
      res.send({ code: 301, msg: `delete failed：lid=${product.lid}` });
    }
  });
});


//4.商品添加 POST /add
router.post("/add", (req, res) => {
  //1.1获取数据
  let product = req.body;
  //1.2验证各项数据是否为空
  let codeno = 400;
  //遍历对象的属性
  for (const key in product) {
    codeno++;
    if (!product[key]) {
      res.send({ code: codeno, msg: `${key} required` });
      return;
    }
  }
  //1.3执行SQL语句
  let sql = "INSERT INTO ss_product SET ?";
  pool.query(sql, [product], (err, result) => {
    if (err) {
      res.send({ code: 301, msg: `add failed, err: ${err}`}); //throw err;
      return;
    }

    //如果数据插入成功，响应对象
    if (result.affectedRows > 0) {
      res.send({ code: 200, msg: `add success：id=${result.insertId}` });
    } else {
      res.send({ code: 301, msg: `add failed , err: ${err.sqlMessage}` });
    }
  });
});

//5.商品查询 GET /search 

router.get("/search", (req, res) => {
  let retJson={
    code: 200,
    msg: "search ok",
    recordCount:0,
    pageSize:9,
    pageCount:0,
    pno:req.query.pno || 0,
    data:[],//
  };


  let kw = req.query.kw || "";
  //"mac i5 128g"
  let kws = kw.split(" ");
  //[mac,i5,128g]

  kws.forEach((elem, i, arr) => {
    arr[i] = `title like '%${elem}%'`;
  });

  //join(" and ");
  let where = kws.join(" and ");
  //"title like '%mac%' and title like '%i5%' and title like '%128g%'"
  var sql = `select *,(select md from ss_pic where k_id=lid limit 1) as md from ss_product where ${where}`;
  console.log(sql);
  query(sql, [])
    .then((result) => {
      retJson.count = result.length;
      retJson.pageCount = Math.ceil(retJson.count / retJson.pageSize);
      sql += ` limit ?,?`;
      return query(sql, [retJson.pageSize * retJson.pno, retJson.pageSize]);
    })
    .then((result) => {
      retJson.data = result;
      res.send(retJson);
    });
});



//导出路由器
module.exports = router;

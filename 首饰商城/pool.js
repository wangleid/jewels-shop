const mysql = require("mysql");
//建立连接池对象
let pool  = mysql.createPool({
  connectionLimit : 10,
  host:     "localhost",
  port:     3307,
  user:     "root",
  password: "",
  database: "shoushi",
  multipleStatements: true  //允许query执行多条SQL语句
});
module.exports=pool;
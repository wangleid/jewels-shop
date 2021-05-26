const express=require('express');
//引入连接池
const pool=require('../pool.js');
//创建空路由器
let router=express.Router();
router.get('/index',(req,res)=>{
    let retJson={};
    pool.query(`
    SELECT cid,img,title,href FROM ss_index_carousel;
    SELECT pid,title,details,pic,price,href FROM ss_index_product WHERE seq_recommended>0 ORDER BY seq_recommended  LIMIT 6;
    SELECT pid,title,details,pic,price,href FROM ss_index_product WHERE seq_new_arrival>0 ORDER BY seq_new_arrival LIMIT 6;
    SELECT pid,title,details,pic,price,href FROM ss_index_product WHERE seq_top_sale>0 ORDER BY seq_top_sale LIMIT 6;
    `,(err,result)=>{
        if(err) throw err;
        retJson.carouselItems=result[0];
        retJson.recommendedItems=result[1];
        retJson.newArrialItems=result[2];
        retJson.topSaleItems=result[3];
        res.send(retJson);
    })
});

module.exports=router;
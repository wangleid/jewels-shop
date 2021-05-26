 CREATE DATABASE shoushi DEFAULT CHARACTER SET=UTF8;
    use shoushi;

/**用户表**/
    CREATE TABLE ss_user(
    uid int(10),
    username varchar(20),
    upwd varchar(50),
    email varchar(15),
    phone VARCHAR(16),
    avatar VARCHAR(128),
    user_name VARCHAR(32),
    gender INT (1)
    );




/**用户地址表**/
    CREATE TABLE ss_receiver_address(
    aid int(10),
    user_id int(10),
    receiver varchar(20),
    province  varchar(20),
    city  varchar(50),
    county varchar(50),
    address  varchar(50),
    cellphone  VARCHAR(16),
    fixedphone  VARCHAR(16),
    postcode CHAR(6),
    tag  VARCHAR(16),
    is_default BOOLEAN
    );





    /**购物车表**/
    CREATE TABLE ss_shopping_cart(
    cid int(10),
    user_id int(10),
    product_id int(10),
    count int(10),
    is_checked BOOLEAN
    );
   

    INSERT INTO ss_shopping_cart VALUES(1,1,1,1);

/**用户订单表**/
    CREATE TABLE ss_order(
    aid  int(10),
    user_id int(10),
    address_id int(10),
    status int(10),
    order_time int(10),
    pay_time int(10),
    deliver_time int(10),
    received_time  int(10)
    );

   

/**用户订单详情表**/
    CREATE TABLE ss_order_detail(
    did  int(10),
    order_id  int(10),
    product_id int(10),
    count int(10)
    );

   
   
/**商品类别表**/
    CREATE TABLE ss_family(
    fid int(10),
    name VARCHAR(32)
    );


/**商品表**/
    CREATE TABLE ss_product(
    lid  int(10),
    family_id int(10),
    product_id int(10),
    title VARCHAR(128),
    subtitle VARCHAR(128),
    price DECIMAL(10,2),
    promise VARCHAR(64),
    spec VARCHAR(64),
    name VARCHAR(32),
    category VARCHAR(32),
    details VARCHAR(1024),
    shelf_time int(10),
    sold_count int(10),
    is_onsale BOOLEAN
    );

    
    /**商品详情图表**/
    CREATE TABLE ss_pic(
    pid int(10),
    k_id int(10),
    sm VARCHAR(128),
    md VARCHAR(128),
    lg VARCHAR(128)
    );

    
/**首页轮播广告商品表**/
    CREATE TABLE ss_index_carousel(
    nid int(10),
    img VARCHAR(128),
    title VARCHAR(128),
    href  VARCHAR(128)
    );


/**首页商品**/
    CREATE TABLE ss_index_product(
    pid int(10),
    title VARCHAR(128),
    details VARCHAR(128),
    pic VARCHAR(128),
    price DECIMAL(10,2),
    href  VARCHAR(128),
    seq_recommended TINYINT(10),
    seq_new_arrival TINYINT(10),
    seq_top_sale TINYINT(10)
    );







/**插入用户表数据**/

    INSERT INTO ss_user VALUES(NULL, 'dingding', '123456', 'ding@qq.com', '13501234567', 'img/avatar/default.png', '丁伟', '1');
    INSERT INTO ss_user VALUES(NULL, 'wangsan', '123456', 'wang@qq.com', '13501234567', 'img/avatar/default.png', '张三', '1');
    INSERT INTO ss_user VALUES(NULL, 'lisi', '123456', 'li@qq.com', '13501234567', 'img/avatar/default.png', '李四', '0');
    INSERT INTO ss_user VALUES(NULL, 'wangwu', '123456', 'wang@qq.com', '13501234567', 'img/avatar/default.png', '王五', '1');
    INSERT INTO ss_user VALUES(NULL, 'zhaoliu', '123456', 'zhao@qq.com', '13501234567', 'img/avatar/default.png', '赵六', '0');


/**插入 商品类别表数据**/
   INSERT INTO ss_family VALUES(null,'手镯');
   INSERT INTO ss_family VALUES(null,'项链');
   INSERT INTO ss_family VALUES(null,'耳环');
   INSERT INTO ss_family VALUES(null,'手环');


/**插入 商品表数据**/
INSERT INTO ss_product VALUES(1,1,'爆款','女款',1500.00,'不满意包退','银色','铂金情侣手镯','手镯','时尚','20190822',20,true);
INSERT INTO ss_product VALUES(2,1,'爆款','男款',1500.00,'不满意包退','金色','铂金情侣手镯','手镯','时尚','20190822',65,true);
INSERT INTO ss_product VALUES(3,2,'爆款','女款',1500.00,'不满意包退','银色','铂金情侣项链','项链','时尚','20190825',42,true);
INSERT INTO ss_product VALUES(4,2,'爆款','男款',1500.00,'不满意包退','金色','铂金情侣项链','项链','时尚','20190825',56,true);
INSERT INTO ss_product VALUES(5,3,'爆款','女款',1500.00,'不满意包退','银色','铂金情侣手镯','耳环','时尚','20190812',36,true);
INSERT INTO ss_product VALUES(6,3,'爆款','男款',1500.00,'不满意包退','金色','铂金情侣手镯','耳环','时尚','20190812',34,true);
INSERT INTO ss_product VALUES(7,4,'爆款','女款',1500.00,'不满意包退','银色','铂金情侣手镯','手环','时尚','20190819',47,false);
INSERT INTO ss_product VALUES(8,4,'爆款','男款',1500.00,'不满意包退','金色','铂金情侣手镯','手环','时尚','20190819',56,false);



/**插入首页轮播广告商品表**/
 INSERT INTO ss_index_carousel VALUES(1,'null','null','null'),
(NULL, 'img/index/banner1.png','轮播广告商品1','product_details.html?lid=28'),
(NULL, 'img/index/banner2.png','轮播广告商品2','product_details.html?lid=19'),
(NULL, 'img/index/banner3.png','轮播广告商品3','lookforward.html'),
(NULL, 'img/index/banner4.png','轮播广告商品4','lookforward.html');

 
/**插入首页商品表**/
  INSERT INTO ss_index_product VALUES(NULL, '精品手环系列', '铂金情侣手环', 'img/index/study_computer_img1.png', 3988, 'product_details.html?lid=1', 1, 1, 1),
(NULL, '精品手镯系列', '铂金情侣手镯', 'img/index/study_computer_img1.png', 5988, 'product_details.html?lid=1', 1, 1, 1),
(NULL, '精品项链系列', '铂金情侣项链', 'img/index/study_computer_img1.png', 8988, 'product_details.html?lid=1', 1, 1, 1),
(NULL, '精品耳环系列', '铂金情侣耳环', 'img/index/study_computer_img1.png', 3988, 'product_details.html?lid=1', 1, 1, 1);
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var dateFormat = require('dateformat');
// for email notification
var nodemailer = require('nodemailer');
var smtp = nodemailer.createTransport({
    host: 'dhunter.xyz',
    port: 465,
    auth: {
        user: 'admin@dhunter.xyz',
        pass: 'discount2018!'
    }
});

app.use(bodyParser.json());

//ScheduledTask
var cron = require('node-cron');


// Development database
//const Datastore = require('nedb');
//var users = new Datastore({filename: 'db/users', autoload: true});
//var products = new Datastore({filename: 'db/products', autoload: true});
//var updated = new Datastore({filename: 'db/UpdatedPrice', autoload: true});

// Production databse
var Mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

const dbUser = "hunter";
const dbPass = "WNxR6sjHF7wwGlCg"; //encodeURI("WNxR6sjHF7wwGlCg");
const url = "mongodb://" + dbUser + ":" + dbPass + "@cluster0-shard-00-00-8oyhh.mongodb.net:27017,cluster0-shard-00-01-8oyhh.mongodb.net:27017,cluster0-shard-00-02-8oyhh.mongodb.net:27017/admin?replicaSet=Cluster0-shard-0&ssl=true";


MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("DHunter");
    dbo.createCollection("Products", function(err, res){
        if (err) throw err;
    });
    dbo.createCollection("Trackprice", function(err, res){
        if (err) throw err;
    });
    dbo.createCollection("users", function(err, res){
        if (err) throw err;
    });
    dbo.createCollection("user_prd",function(err, res){
        if(err) throw err;
        db.close();
    });
});

// salt hash
const crypto = require('crypto');
function generateSalt(){
    return crypto.randomBytes(16).toString('base64');
}
function generateHash (password, salt){
    var hash = crypto.createHmac('sha512',salt);
    hash.update(password);
    return hash.digest('base64');
}

var isAuthenticated = function(req, res, next) {
    if(!req.user) return res.status(401).end('access denied');
    next();
}


// enable session
//const session = require('express-session');
//app.use(session({
    
//}));

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(express.static('frontend'));

app.get("/", function(req, res, next){
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
})

app.get("/price", function(req, res, next){
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
})

// ------Account Management----------

// create user
app.post('/api/users/signup', function(req, res, next){
    if(!('username' in req.body)) return res.status(400).end('username is missing');
    if(!('password' in req.body)) return res.status(400).end('password is missing');
    var username = req.body.username;
    var password = req.body.password;
    MongoClient.connect(url, function(err, db) {
        if (err) return res.status(500).err;
        var dbo = db.db("DHunter");
        dbo.collection("users").findOne({username:username}, function(err, user){
            if(err) return res.status(500).end(err);
            // check whether user exists or not
            if(user) return res.status(409).end("username: " + username + " already exists");
            var salt = generateSalt();
            var hash = generateHash(password, salt);
            // create new user
            dbo.collection("users").insertOne({username:username, hash:hash, salt:salt}, function(err){
                if(err) return res.status(500).end(err);
                // cookie later
                
                
            });
            return res.json('user' + username + 'signed up!');
        });  
    });
}); 

//sign in
app.post('/api/users/signin', function(req, res, next){
    if(!('username' in req.body)) return res.status(400).end('username is missing');
    if(!('password' in req.body)) return res.status(400).end('password is missing');
    var username = req.body.username;
    var password = req.body.password;
    // retrieve user from the database
    MongoClient.connect(url, function(err,db){
        if (err) return res.status(500).end(err);
        var dbo = db.db("DHunter");
        dbo.collection("users").findOne({username:username}, function(err, user){
            if(err) return res.status(500);
            if(!user) return res.status(401).end("access denied");
            if(user.hash !== generateHash(password, user.salt)) return res.status(401).end("access denied");
            
            //session
            
            
        });
        return res.json("user: "+username+"signed in");
        db.close();
    });
    
}); 

//sign out
app.get('/api/users/signout', function(req, res, next){
    /*
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    */
    return res.redirect('/');
}); 

//send verify email upon user creation
app.get('/api/users/email/verif/:uid', function(req, res, next){
     
}); 

// send email to reset password. Body {email}
app.post('/api/users/email/password/', function(req, res, next){
     
}); 

//reset password. Body {newPassword, reNewPassword}
app.post('/api/users/setPassword/:uid/:magicCode', function(req, res, next){
     
}); 


// -----------Crawler for retailers-----------------




// starting tracking the product
///task
function tracking_price(product){
    var prd_url = product.url;
    var prd_price = product.listedPrice;
    request(prd_url, function(err, response, body){
        if(err) return res.status(404).end("url does not exist");
        if (response && response.statusCode === 200) {
            var $ = cheerio.load(body);
            var retailer = prd_url.split('.')[1];
            var title = $("h1.product-title").find("span").text();
            var price_str1 = $("div.price-module").find("span.amount").text();
            // price from string to float
            var p_len = price_str1.length;
            var price_str2 = price_str1.substring(1,p_len);
            var check_price = parseFloat(price_str2);
            var img_url = $("div.gallery-image-container img").attr('src');
            // check price
            console.log(check_price, prd_price);
            // if price is different, then start tracking
            if(check_price !== prd_price) {
                MongoClient.connect(url, function(err, db){
                    if (err) console.log(err);
                    var dbo = db.db("DHunter");
                    var new_date = new Date();
                    var date = dateFormat(new_date, "mmmm dd yyyy");
                    dbo.collection("Trackprice").insertOne({name: title, retailer:retailer, url:prd_url, listedPrice:check_price, img:img_url, date:date}, function(err, res){
                        if (err) return res.status(500).end(err);
                    });
                    db.close();
                });
            }
        }
    });
}
// schedule to update price
cron.schedule('* */12 * * *', function(){
    console.log('running a task every 12 hours');
    MongoClient.connect(url, function(err, db) {
        if (err) return res.status(500).end(err);
        var dbo = db.db("DHunter");
        dbo.collection("Products").find({}).toArray(function(err, product){
            if (err) return res.status(500).end(err);
            // if product exist
            if(product){
                product.forEach(tracking_price);
            }
            db.close();
        });
    });
});


//-----------Product management--------------------- 

// Get product price history via url if exist, otherwise start tracking
//for bestbuy
// curl -X GET http://localhost:3000/api/products/?url="https://www.bestbuy.ca/en-ca/product/sony-50-4k-uhd-hdr-led-linux-smart-tv-kd50x690e/12322177.aspx?"
// curl -X GET http://localhost:3000/api/products/?url="https://www.bestbuy.ca/en-ca/product/canon-canon-pixma-wireless-all-in-one-inkjet-printer-mx492-mx492/10360807.aspx?"

// curl -X GET http://localhost:3000/api/products/?url="https://www.bestbuy.ca/en-ca/product/xbox-one-x-1tb-console/11558330.aspx?"

// curl -X GET http://localhost:3000/api/products/?url="https://www.bestbuy.ca/en-ca/product/nordictrack-c-850i-folding-treadmill/12062838.aspx?"
// curl -X GET http://localhost:3000/api/products/?url="https://www.bestbuy.ca/en-ca/product/persona-5-ps4/10620242.aspx?“
app.get('/api/products/', function(req, res, next){
    product_url = req.query['url'];
    var retailer = product_url.split('.')[1];
    if(retailer === "bestbuy") {
        request(product_url,function(err, response, body) {
            if(err) return res.status(404).end("url does not exist");
            if (response.statusCode !== 200) return res.status(response.statusCode).end("url does not exist");
            if (response && response.statusCode === 200) {
                var $ = cheerio.load(body);
                var title = $("h1.product-title").find("span").text();
                var price = $("div.price-module").find("span.amount").text();
                // price from string to float
                var price_len = price.length;
                var p = price.substring(1,price_len);
                var listed_price = parseFloat(p);

                var img_url = $("div.gallery-image-container img").attr('src');
                // title, price, url, and image url.
                console.log("Title:  ",title,"  ", "   listedPrice: ",listed_price);
                //console.log("url:", product_url);
                //console.log("image: ", img_url);
                
                MongoClient.connect(url, function(err, db) {
                    if (err) return res.status(500).end(err);
                    var dbo = db.db("DHunter");
                    dbo.collection("Products").findOne({name:title, retailer:retailer}, function(err, prd){
                        if(err) return res.status(500).end(err);
                        if(!prd) {
                            var new_date = new Date();
                            var date = dateFormat(new_date, "mmmm dd yyyy");
                            var new_product = {name: title, retailer:retailer, url:product_url, listedPrice:listed_price, img:img_url, date:date}
                            dbo.collection("Products").insertOne(new_product, function(err, res){
                                if (err) return res.status(500).end(err);
                            });
                            dbo.collection("Trackprice").insertOne(new_product, function(err, res){
                                if (err) return res.status(500).end(err);
                            });
                            return res.status(200).json({status:"added", msg: "product: " + title + " is added to tracking."});
                        }else{
                            return res.status(200).json({status:"tracked", msg: "product: " + title + " already exists."});
                        }
                        db.close();
                    });

                });
            }
        });
    }else{
        res.status(404).end("Retailer " + retailer + " is not supported at the moment.");
    }
}); 

// curl -X GET http://localhost:3000/api/details/?url="https://www.bestbuy.ca/en-ca/product/sony-50-4k-uhd-hdr-led-linux-smart-tv-kd50x690e/12322177.aspx?"
// get product detail via url
app.get('/api/details/', function(req, res, next){
    var product_url = req.query['url'];
    request(product_url,function(err, response, body) {
        if (err) return res.status(404).end("url does not exist");
        if (response.statusCode !== 200) return res.status(response.statusCode).end("url does not exist");
        if (response && response.statusCode === 200) {
            var $ = cheerio.load(body);
            var title = $("h1.product-title").find("span").text();
            var price = $("div.price-module").find("span.amount").text();
            // price from string to float
            var price_len = price.length;
            var p = price.substring(1,price_len);
            var listed_price = parseFloat(p);
            var img_url = $("div.gallery-image-container img").attr('src');
            var result = {name:title, image:img_url,listedPrice:listed_price};
            return res.json(result);
        }
    });
});

// curl -X GET http://localhost:3000/api/price/?url="https://www.bestbuy.ca/en-ca/product/nordictrack-c-850i-folding-treadmill/12062838.aspx?"

// curl -X GET http://localhost:3000/api/price/?url="https://www.bestbuy.ca/en-ca/product/sony-50-4k-uhd-hdr-led-linux-smart-tv-kd50x690e/12322177.aspx?"
// get the min median max price
app.get('/api/price/', function(req, res, next){
    var product_url = req.query['url'];
    request(product_url,function(err, response, body) {
        if (err) return res.status(404).end("url does not exist");
        if (response.statusCode !== 200) return res.status(response.statusCode).end("url does not exist");
        if (response && response.statusCode === 200) {
            MongoClient.connect(url, function(err, db){
                if(err) return res.status(500).end(err);
                var dbo = db.db("DHunter");
                var trk = dbo.collection("Trackprice");
                var query = { 'url' : product_url };
                dbo.collection('Trackprice').find(query).sort({listedPrice:1}).toArray(function(err, products){
                    if(err) return res.status(500).end(err);
                    if(products.length === 0) return res.json("No price history!");
                    var i=0;
                    var price_list = [];
                    var min = 0;
                    var med = 0;
                    var max = 0;
                    for(i=0;i<products.length;i++){
                        price_list.push(products[i].listedPrice);
                    }
                    price_list.sort((a,b) => a-b);
                    console.log(products[0]);
                    var min_date = products[0].date;
                    min = price_list[0];
                    var low = Math.floor((price_list.length - 1) / 2);
                    var high = Math.ceil((price_list.length - 1) / 2);
                    med = (price_list[low] + price_list[high]) / 2;
                    max = price_list[price_list.length-1];
                    var max_date = products[price_list.length-1].date;
                    var $ = cheerio.load(body);
                    var price = $("div.price-module").find("span.amount").text();
                    // price from string to float
                    var price_len = price.length;
                    var p = price.substring(1,price_len);
                    var current_price = parseFloat(p);
                    var new_date = new Date();
                    var date = dateFormat(new_date, "mmmm dd yyyy");
                    var result = {'minmum': [min, min_date], 'median' : [med,null], 'maximun' : [max, max_date], 'current':[current_price, date]};
                    console.log(result);
                    return res.json(result);
                    db.close();
                });
            });
        }
    });
});

// curl -X GET http://localhost:3000/api/pricehistory/?url="https://www.bestbuy.ca/en-ca/product/sony-50-4k-uhd-hdr-led-linux-smart-tv-kd50x690e/12322177.aspx?"
// get price history
app.get('/api/pricehistory/', function(req, res, next){
    var product_url = req.query['url'];
    MongoClient.connect(url, function(err, db){
        if(err) return res.status(500).end(err);
        var dbo = db.db("DHunter");
        var trk = dbo.collection("Trackprice");
        var query = { 'url' : product_url };
        
        dbo.collection('Trackprice').find(query).toArray(function(err, products){
            if(err) return res.status(500).end(err);
            if(products.length === 0) return res.json("No price history!");
            var i=0;
            var price_list = [];
            for(i=0;i<products.length;i++){
                price_list.push([products[i].listedPrice,products[i].date]);
            }
            return res.json(price_list);
            db.close();
        });
    });
});




// Get top dicounted products (Paginated)
app.get('/api/products/deals/', function(req,res,next){
    MongoClient.connect(url, function(err, db){
        if (err) return res.status(500).end(err);
        var dbo = db.db("DHunter");
        var trk = dbo.collection("Trackprice");
        trk.aggregate([{match:{}},{$group:{name:{}}}]).next(function(err, doc){
            
        });
        db.close(); 
    });
    
});

// Set email notification for product :id. Body {email, productId}
app.post('/api/products/notification/', function(req, res, next){

});

// Remove email notification for product :id. Body {email, productId}
app.delete('/api/products/notification/', function(req, res, next){

});

//



// Server
const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function(err){
    if(err) console.error(err);
    else console.info("HTTP server on http://localhost:%s", PORT);
})


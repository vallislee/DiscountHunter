const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookie = require('cookie');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var dateFormat = require('dateformat');
express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
app.use(bodyParser.json());

// ----------- Notification api ------------
var nodemailer = require('nodemailer');
var validator = require("email-validator");

var smtp = nodemailer.createTransport({
    //service: 'Gmail',
    host:'mail.privateemail.com',
    port: 587,
    auth: {
        //user: 'discounthunter.mail@gmail.com',
        user : 'admin@dhunter.xyz',
        pass: 'discount2018!'
    }
});
//------------ ScheduledTask ---------------
var cron = require('node-cron');


// -------- Production Database ------------
var Mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var sanitize = require('mongo-sanitize');
const dbUser = "hunter";
const dbPass = "WNxR6sjHF7wwGlCg"; //encodeURI("WNxR6sjHF7wwGlCg");
const url = "mongodb://" + dbUser + ":" + dbPass + "@cluster0-shard-00-00-8oyhh.mongodb.net:27017,cluster0-shard-00-01-8oyhh.mongodb.net:27017,cluster0-shard-00-02-8oyhh.mongodb.net:27017/admin?replicaSet=Cluster0-shard-0&ssl=true";

// ========= Create Collection =============
var DBconnection;
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("DHunter");
    DBconnection = dbo;
    dbo.createCollection("Products", function(err, res){
        if (err) throw err;
    });
    dbo.createCollection("Trackprice", function(err, res){
        if (err) throw err;
    });
    dbo.createCollection("localusers", function(err, res){
        if (err) throw err;
    });
    dbo.createCollection("googleusers", function(err, res){
        if (err) throw err;
    });
    dbo.createCollection("non_signed_user",function(err, res){
        if (err) throw err;
    });
    dbo.createCollection("user_prd",function(err, res){
        if (err) throw err;
    });
    dbo.createCollection("Top_deals",function(err, res){
        if (err) throw err; 
    });

    dbo.createCollection("Feedbacks",function(err, res){
        if (err) throw err; 
    });
});

// ============== Salt Hash ================
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
    console.log(req.user);
    if(!req.user) return res.status(401).end('access denied');
    next();
}

// ============ enable session =============

// =============== Cookie =================

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(express.static('frontend'));

app.get("/", function(req, res, next){
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
})

app.get("/price", function(req, res, next){
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
})

app.get("/profile", function(req, res, next){
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
})

app.get("/contactUs", function(req, res, next){
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
})

app.get("/credits", function(req, res, next){
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
})


const session = require('express-session');
app.use(session({
    secret: 'DiscountHunter secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(function(req, res, next){
    req.user = ('user' in req.session)? req.session.user : null;
    var username = (req.user)? req.user._id : '';
    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    next();
});

// ------Account Management----------

// =========== google sign in ==============
const {OAuth2Client} = require('google-auth-library');

// dev
var CLIENT_ID = "340941719865-nluen8ujll66mu8tst55ebj7ee46gsa9.apps.googleusercontent.com";
var clientSecret = 'A2fkl3QN7pX9ptSV4XxphU_J';


const CaptchaSecret = "6LckCFAUAAAAAEzjOWzQQCepRZnRR_5Bdkx1CktC";

// For testing purpose
// const client = new OAuth2Client(CLIENT_ID);
// async function verify(token) {
//     const ticket = await client.verifyIdToken({
//         idToken: token,
//         audience: CLIENT_ID
//     });
//     const payload = ticket.getPayload();
//     const userid = payload['sub'];
// }

app.post('/oauth/google/sigin/', function(req, res, next){
    var client_token= req.body.token;
    console.log("Accepted!");
    request('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + client_token, function(err, response, body){
        console.log(response.statusCode);
        if (err) return res.status(404).end("Client does not exist");
        if (response.statusCode !== 200) return res.status(response.statusCode).end("Client does not exist");
        if (response && response.statusCode === 200) {
            var info = JSON.parse(body);
            var username = info.name;
            var user_email = info.email;
            console.log(username, user_email);

            var dbo = DBconnection;
            dbo.collection("googleusers").findOne({username : username, email : user_email}, function(err, user) {
                if (err) return res.status(500).end(err);
                if (user) {
                    req.session.user = user;
                    console.log("==============");
                    console.log(req.session.user);
                    res.setHeader('Set-Cookie', cookie.serialize('username', user._id, {
                        path : '/', 
                        maxAge: 60 * 60 * 24 * 7
                    }));
                    return res.json({status:200, session:req.session.user});
                }
                else {
                    dbo.collection("googleusers").insertOne({username : username, email:user_email, type:"google"}, function(err, user){
                        if (err) return res.status(500).end(err);
                        req.session.user = user;
                        res.setHeader('Set-Cookie', cookie.serialize('username', user._id, {
                            path : '/', 
                            maxAge: 60 * 60 * 24 * 7
                        }));
                        return res.json({status:200, session:req.session.user.ops[0]});
                    });
                }
            });
        }
    });
});

// create localuser
app.post('/api/local/signup', function(req, res, next){
    if(!('username' in req.body)) return res.status(400).end('username is missing');
    if(!('password' in req.body)) return res.status(400).end('password is missing');
    if(!('email' in req.body)) return res.status(400).end('email is missing');
    if(!('captcha' in req.body)) return res.status(400).end('please verify you are not a robot');
    var username = sanitize(req.body.username);
    var password = req.body.password;
    var email = sanitize(req.body.email);
    if(!(validator.validate(email))) return res.status(400).end('enter a valid email address');
    var captcha = req.body.captcha;

    request("https://www.google.com/recaptcha/api/siteverify?secret=" + CaptchaSecret  + "&response=" + captcha, function(err, response, body){
        if (err) return res.status(500).end(err);
        body = (JSON.parse(body));
        if (!body.success) return res.status(400).end('Failed to verify');
        var dbo = DBconnection;
        dbo.collection("localusers").findOne({email : email}, function(err, user){
            if(err) return res.status(500).end(err);
            // check whether user exists or not
            if(user) return res.status(409).end("email: " + email + " already exists");
            var salt = generateSalt();
            var hash = generateHash(password, salt);
            // create new user
            dbo.collection("localusers").insertOne({username:username, hash:hash, salt:salt, email:email, type:"local"}, function(err, user){
                if(err) return res.status(500).end(err);
                return res.json("email" + email + "signed up");
            });
        });
    })
});


// curl -X POSOT -d "email=kid@test.com&password=123" http://localhost:3000/api/local/signin
//sign in
app.post('/api/local/signin', function(req, res, next){
    if(!('email' in req.body)) return res.status(400).end('email is missing');
    if(!('password' in req.body)) return res.status(400).end('password is missing');
    if(!('captcha' in req.body)) return res.status(400).end('please verify you are not a robot');
    var email = sanitize(req.body.email);
    if(!(validator.validate(email))) return res.status(400).end('enter a valid email address');
    var password = req.body.password;
    var captcha = req.body.captcha;
    // retrieve user from the database
   
    request("https://www.google.com/recaptcha/api/siteverify?secret=" + CaptchaSecret  + "&response=" + captcha, function(err, response, body){
        if (err) return res.status(500).end(err);
        body = (JSON.parse(body));

        if (!body.success) return res.status(400).end('Failed to verify');
        var dbo = DBconnection;
        dbo.collection("localusers").findOne({email:email}, function(err, user){
            if(err) return res.status(500);
            if(!user) return res.status(401).end("Access denied");
            if(user.hash !== generateHash(password, user.salt)) return res.status(401).end("access denied");
            //session
            req.session.user = user;
            
            res.setHeader('Set-Cookie', cookie.serialize('username', user._id, {
                path : '/', 
                maxAge: 60 * 60 * 24 * 7
            }));
            return  res.json("User " + email + " signed in.");
        });
    });
});

// reset password
app.post('/api/user/resetpw/', isAuthenticated, function(req, res, next) {
    if(!('old_pw' in req.body)) return res.status(400).end('old password is missing');
    if(!('new_pw' in req.body)) return res.status(400).end('new password is missing');
    var user_email = sanitize(req.session.user.email);
    if(!(validator.validate(email))) return res.status(400).end('enter a valid email address');
    var old_pw = req.body.old_pw;
    var new_pw = req.body.new_pw;
    dbo.collection("localusers").findOne({email:user_email}, function(err, user) {
        if (err) return res.status(500).end(err);
        if (user.hash !== generateHash(old_pw, user.salt)) return res.status(401).end('incorrect password');
        var salt = generateSalt();
        var hash = generateHash(new_pw, salt);
        dbo.collection("localusers").updateOne({email:user_email},{$set:{hash : hash, salt : salt}}, function(err, result){
            if (err) return res.status(500).end(err);
            return res.json("password updated");
        });
    });
});

//sign out
app.get('/api/users/signout', function(req, res, next){
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    res.redirect('/');
    return res.status(200).end("signout");
}); 

// add desire price for non-signed in user
app.post('/api/nonsigned/tracking', function(req, res, next) {
    if(!('email' in req.body)) return res.status(400).end('email is missing');
    if(!('desire_price' in req.body)) return res.status(400).end('desire price is missing');
    if(!('url' in req.body)) return res.status(400).end('url is missing');
    var user_email = sanitize(req.body.email);
    var desire_price = sanitize(req.body.desire_price);
    var product_url = sanitize(req.body.url);
    var dbo = DBconnection;
    dbo.collection("non_signed_user").findOne({email:user_email}, function(err, user){
        if (err) return res.status(500);
        if (user) {
            dbo.collection("non_signed_user").findOne({email:user_email, url:product_url}, function(err, prd){
                if (err) return res.status(500);
                if (prd) {
                    dbo.collection("non_signed_user").updateOne({email:user_email, url:product_url},{$set:{desire_price:desire_price}}, function(err, data){
                        return res.json(data);
                        //db.close();
                    });
                }else{
                    dbo.collection("non_signed_user").insertOne({email:user_email, desire_price:desire_price, url:product_url}, function(err, data){
                        return res.json(data);
                        //db.close();
                    });
                }
            });
        }else{
            dbo.collection("non_signed_user").insertOne({email:user_email, desire_price:desire_price, url:product_url}, function(err, data){
                return res.json(data);
                //db.close();
            });
        }
    });
  
});

// add desire price for signed in user
app.post('/api/signed/tracking',isAuthenticated, function(req, res, next) {
    if(!('desire_price' in req.body)) return res.status(400).end('desire price is missing');
    if(!('url' in req.body)) return res.status(400).end('url is missing');
    var username = req.session.user.username;
    var user_email = req.session.user.email;
    var desire_price = sanitize(req.body.desire_price);
    var product_url = sanitize(req.body.url);
    var dbo = DBconnection;
    dbo.collection("user_prd").findOne({email:user_email}, function(err, user) {
        if (err) return res.status(500);
        dbo.collection("Products").findOne({url:product_url}, function(err, products) {
            if (err) return res.status(500);
            var product_name = products.name;
            if (user) {
                dbo.collection("user_prd").findOne({email:user_email, url:product_url}, function(err, prd){
                    if (err) return res.status(500);
                    if (prd) {
                        dbo.collection("user_prd").updateOne({email:user_email, url:product_url},{$set:{desire_price:desire_price}}, function(err, data) {
                            if (err) return res.status(500).end(err);
                            return res.status(200).json("Product: " + product_name + " is tracking!");
                        });
                    }else{
                        dbo.collection("user_prd").insertOne({email:user_email, desire_price:desire_price, product_name : product_name, url:product_url}, function(err, data) {
                            if (err) return res.status(500).end(err);
                            return res.status(200).json("Product: " + product_name + " is tracking!");
                        });
                    }
                });
            }else{
                dbo.collection("user_prd").insertOne({email:user_email, desire_price:desire_price, product_name : product_name, url:product_url}, function(err, data) {
                    if (err) return res.status(500).end(err);
                    return res.status(200).json("Product: " + product_name + " is tracking!");
                });
            }
        });
    });
   
    
});

// Remove desire price for signed in user
app.delete('/api/signed/tracking/:uid', isAuthenticated, function(req, res, next){
    if (!req.params.uid) return res.status(404).end("No id was provided");
    
    var id =  Mongo.ObjectID(sanitize(req.params.uid));
    var dbo = DBconnection;
    dbo.collection("user_prd").findOne({_id:id}, function(err, result){
        if (err) return res.status(500).end(err);
        if (!result) return res.status(404).end("Id:" + req.params.uid + " does not exist");

        if (result.email != req.session.user.email) return res.status(401).end("Access denied");
        
        dbo.collection("user_prd").deleteOne({_id: id}, function(err, result){
            if (err) return res.status(500).end(err);
            return res.status(200).json("Tracking remove for Id:" + req.params.uid);
        })
    });
});

// ========================================================
// ----------- Starting Tracking The Product --------------
// ========================================================
///task
function tracking_price(product){
    var prd_url = product.url;
    var prd_price = product.listedPrice;
    request(prd_url, function(err, response, body){
        if(err) throw (err);
        if (response && response.statusCode === 200) {
            var $ = cheerio.load(body);
            var retailer = prd_url.split('.')[1];
            var title = $("h1.product-title").find("span").text();
            var price_str1 = $("div.price-module").find("span.amount").text();
            // price from string to float
            var p_len = price_str1.length;
            var price_str2 = price_str1.substring(1,p_len);
            var check_price = parseFloat(price_str2.replace(/,/g,''));
            var img_url = $("div.gallery-image-container img").attr('src');
            // check price
            console.log(check_price, prd_price);
            var dbo = DBconnection;
            var new_date = new Date();
            //var date = dateFormat(new_date, "mmmm dd yyyy");
            dbo.collection("Trackprice").find({url:prd_url}).sort({date:-1}).toArray(function(err, prd){
                if (err) throw (err);    
                if (prd) {
                    var latest_prd_Price = prd[0].listedPrice;
                    var previous_priceChange = prd[0].PriceChange;
                    var priceChange = 0;
                    var diff = (check_price - latest_prd_Price).toFixed(2);
                    var diff_price = parseFloat(diff);
                    if (diff_price === 0 && previous_priceChange === 0) {
                        priceChange = 0;
                    }else if(diff_price === 0 && previous_priceChange !== 0){
                        priceChange = previous_priceChange;
                    }else if(diff_price !== 0 && previous_priceChange === 0) {
                        priceChange = diff_price;
                    }
                    dbo.collection("Trackprice").insertOne({name: title, retailer:retailer, url:prd_url, listedPrice:check_price, PriceChange:priceChange, img:img_url, date:new_date}, function(err, res){
                        if (err) throw (err);
                    });
                }
            });
        }
    });
}

function email_notification(user) {
    var email = user.email;
    var desire_price = user.desire_price;
    var product_url = user.url;
    request(product_url, function(err, response, body){
        if (err) throw (err);
        if (response && response.statusCode === 200) {
            var $ = cheerio.load(body);
            var title = $("h1.product-title").find("span").text();
            var price_str1 = $("div.price-module").find("span.amount").text();
            // price from string to float
            var p_len = price_str1.length;
            var price_str2 = price_str1.substring(1,p_len);
            var check_price = parseFloat(price_str2.replace(/,/g,''));
            if (check_price <= desire_price) {
                var diff = (desire_price - check_price).toFixed(2);
                var mailOptions = {
                  from: 'admin@dhunter.xyz',
                  to: email,
                  subject: 'DiscountHunter :' + title + 'Price Dropped',
                  text: "Product: " + title + " has dropped at " + check_price + ", and it is " + diff + " below you desire price."
                };
                smtp.sendMail(mailOptions, function(error, info){
                  if (error) {
                    throw (error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });
            }
        }
    });
}


function send_email_notification(){
    var dbo = DBconnection;
    dbo.collection("user_prd").find({}).toArray(function(err, user) {
        if (err) return res.status(500).end(err);
        if (user) {
            console.log("email Notification...");
            user.forEach(email_notification);
        }
    });
    dbo.collection("non_signed_user").find({}).toArray(function(err, user) {
        if (err) return res.status(500).end(err);
        if (user) {
            console.log("email Notification...");
            user.forEach(email_notification);
        }
    });
}
function topdeals(products) {
    var prd_name = products.name;
    var prd_url = products.url;
    var dbo = DBconnection;
    dbo.collection("Trackprice").find({url:prd_url}).sort({date:-1}).toArray(function(err, prd){
        if (err) throw (err);
        if (prd) {
            var latest_prd = prd[0];
            console.log(prd);
            var latest_prd_name = latest_prd.name;
            var latest_prd_url = latest_prd.url;
            var price_diff = latest_prd.PriceChange;
            // if the product is onsale
            var new_date = new Date();
            //var date = dateFormat(new_date, "mmmm dd yyyy");
            if(price_diff < 0) {
                dbo.collection("Top_deals").findOne({name:prd_name, url:prd_url}, function(err, prd) {
                    if (err) throw err;
                    if (prd) {
                        console.log("found!!!");
                        dbo.collection("Top_deals").updateOne({name:prd_name, url:prd_url},{$set:{PriceChange:price_diff, date:new_date}}, function(err, data) {
                            if (err) throw err;
                        });
                    }else{
                        console.log("inserting");
                        dbo.collection("Top_deals").insertOne(latest_prd, function(err, data){
                            if (err) throw err;
                        });
                    }
                });
            }else{
                // remove from topdeal db if not onsale
                dbo.collection("Top_deals").findOne({name:prd_name, url:prd_url}, function(err, prd) {
                    if (err) throw err;
                    if (prd) {
                        dbo.collection("Top_deals").deleteOne({name:prd_name, url:prd_url}, function(err, prd){
                            if (err) throw err; 
                        });
                    }
                });
            }
        }
    });
}

var updateTrackProductPirce = function(){
    var dbo = DBconnection;
    dbo.collection("Products").find({}).toArray(function(err, product){
        if (err) return res.status(500).end(err);
        // if product exist
        if(product){
            console.log("Starting update...");
            product.forEach(tracking_price);
            console.log("Daily product price updated");
        }
    });
    dbo.collection("user_prd").find({}).toArray(function(err, user) {
        if (err) return res.status(500).end(err);
        if(user){
            console.log("email Notification...");
            user.forEach(email_notification);
        }
    });
    dbo.collection("non_signed_user").find({}).toArray(function(err, user) {
        if (err) return res.status(500).end(err);
        if(user){
            console.log("email Notification...");
            user.forEach(email_notification);
        }
    });
}

var update_topdeals = function() {
    var dbo = DBconnection;
    dbo.collection("Products").find({}).toArray(function(err, product){
        if (err) throw (err);
        if (product){
            console.log("Updating top deals");
            product.forEach(topdeals);
        }
    });
}


// schedule to update price
cron.schedule('30 5 * * *', function(){
    updateTrackProductPirce();
    console.log("Daily update price complete")
});


cron.schedule('1 7 * * *', function(){
    update_topdeals();
});


//Manual trigger daily update
//curl -X GET http://localhost:3000/api/tool/manualUpdate
app.get("/api/tool/manualUpdate", function(req, res, next){
    //dailyUpdate();
    updateTrackProductPirce();
    return res.status(200).end("Updating in progress");
});

app.get("/api/tool/manualUpdatedeals", function(req, res, next){
    update_topdeals();
    res.status(200).end("Updating in progress");
});

// ========================================================


// ========================================================
//------------------Product Management--------------------- 
// ========================================================

// Get product price history via url if exist, otherwise start tracking
// curl -X GET http://localhost:3000/api/products/?url="https://www.bestbuy.ca/en-ca/product/persona-5-ps4/10620242.aspx?“
app.get('/api/products/', function(req, res, next){
    product_url = req.query['url'];
    var url_split = product_url.split('.');
    var url_split2 = url_split[2].split('/');
    var is_product = url_split2[2];
    if (!(is_product == 'product')) return res.status(404).end("Invalid URL was provided.");
    var url_splot_first = url_split[0];
    var is_mobile = url_split[0][url_splot_first.length-1];
    var retailer = url_split[1];
    console.log(retailer,is_mobile);
    if(retailer === "bestbuy" && is_mobile !== 'm') {
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
                var listed_price = parseFloat(p.replace(/,/g,''));
                
                var img_url = $("div.gallery-image-container img").attr('src');
               
                var dbo = DBconnection;
                dbo.collection("Products").findOne({name:title, retailer:retailer}, function(err, prd){
                    if(err) return res.status(500).end(err);
                    if(!prd) {
                        var new_date = new Date();
                        var date = dateFormat(new_date, "mmmm dd yyyy");
                        var new_product = {name: title, retailer:retailer, url:product_url, listedPrice:listed_price, img:img_url, date:new_date}
                        dbo.collection("Products").insertOne(new_product, function(err, res){
                            if (err) return res.status(500).end(err);
                        });
                        dbo.collection("Trackprice").insertOne({name: title, retailer:retailer, url:product_url, listedPrice:listed_price, PriceChange:0, img:img_url, date:new_date}, function(err, res){
                            if (err) return res.status(500).end(err);
                        });
                        return res.status(200).json({status:"added", msg: "product: " + title + " is added to tracking."});
                    }else{
                        return res.status(200).json({status:"tracked", msg: "product: " + title + " already exists."});
                    }
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
            var listed_price = parseFloat(p.replace(/,/g,''));
            var img_url = $("div.gallery-image-container img").attr('src');
            var result = {name:title, image:img_url,listedPrice:listed_price};
            return res.json(result);
        }
    });
});

// curl -X GET http://localhost:3000/api/price/?url="https://www.bestbuy.ca/en-ca/product/nordictrack-c-850i-folding-treadmill/12062838.aspx?"
// get the min median max price
app.get('/api/price/', function(req, res, next){
    var product_url = req.query.url;
    var query = {url: product_url};
    var dbo = DBconnection;
    console.log(req.query);
    console.log(query);
    dbo.collection('Trackprice').find(query).sort({listedPrice:1}).toArray(function(err, products){
        if(err) return res.status(500).end(err);
        if(products.length === 0) return res.status(500).json("No price history!");
        var i=0;
        var price_list = [];
        var min = 0;
        var med = 0;
        var max = 0;
        for(i=0;i<products.length;i++){
            price_list.push(products[i].listedPrice);
        }
        price_list.sort((a,b) => a-b);
        var min_tempdate = products[0].date;
        var min_date = dateFormat(min_tempdate, "mmmm dd yyyy");
        min = price_list[0];
        var low = Math.floor((price_list.length - 1) / 2);
        var high = Math.ceil((price_list.length - 1) / 2);
        med = ((price_list[low] + price_list[high]) / 2).toFixed(2);
        max = price_list[price_list.length-1];
        var max_tempdate = products[price_list.length-1].date;
        var max_date = dateFormat(max_tempdate, "mmmm dd yyyy");

        dbo.collection('Trackprice').find(query).sort({date:1}).toArray(function(err, data){
            if(err) return res.status(500).end(err);
            var current_price = data[data.length-1].listedPrice;
            var temp_date = data[data.length-1].date;
            var current_date = dateFormat(temp_date, "mmmm dd yyyy");
            var result = {'minmum': [min, min_date], 'median' : [med,null], 'maximun' : [max, max_date], 'current':[current_price, current_date]};
            return res.json(result);
        });
    });
});

// curl -X GET http://localhost:3000/api/pricehistory/?url="https://www.bestbuy.ca/en-ca/product/sony-50-4k-uhd-hdr-led-linux-smart-tv-kd50x690e/12322177.aspx?"
// get price history
app.get('/api/pricehistory/', function(req, res, next){
    var product_url = req.query.url;
    var query = {url: product_url};
    var dbo = DBconnection;
    console.log(product_url);
    dbo.collection('Trackprice').find(query).sort({date:1}).toArray(function(err, products){
        if(err) return res.status(500).end(err);
        if(products.length === 0) return res.status(500).json("No price history!");
        
        var i=0;
        var price_list = [];
        for(i=0;i<products.length;i++){
            var product_date = dateFormat(products[i].date,"mmmm dd yyyy")
            price_list.push([products[i].listedPrice,product_date]);
        }
        return res.json(price_list);
    });  
});

// =======================================================
// curl -X GET http://localhost:3000/api/user/tracked/?offset=0
// tracked items for current user
app.get('/api/user/tracked/', isAuthenticated, function(req,res,next) {
    var user_email = req.session.user.email;
    var user_name = req.session.user.username;
    var offset = req.query['offset'];
    var dbo = DBconnection;
    var lim = parseInt(offset);
    var mysort = {date:1};
    dbo.collection('user_prd').find({email:user_email}).sort(mysort).skip(lim).limit(10).toArray(function(err, result) {
        if (err) return res.status(500).end(err);
        var package = [user_name, user_email, result]
        return res.json(package);
    });
});
// curl -X GET http://localhost:3000/api/user/tracked/num
// total tracked items for current user
app.get('/api/user/tracked/num/', isAuthenticated, function(req,res,next){
    var user_email = req.session.user.email;
    var dbo = DBconnection;
    dbo.collection('user_prd').find({email:user_email}).toArray(function(err, result) {
        if (err) return res.status(500).end(err);
        return res.json(result.length);
    });
});

// ========================================================
// curl -X GET http://localhost:3000/api/products/deals/
// Get top dicounted products (Paginated)
app.get('/api/products/deals/', function(req, res, next){
    var offset = req.query['offset'];
    var dbo = DBconnection;
    var lim = parseInt(offset);
    dbo.collection('Top_deals').find({}).sort({PriceChange:1}).skip(lim).limit(8).toArray(function(err, prds){
        if (err) return res.status(500).end(err);
        return res.json(prds);
    });
});

// Total number of onsale items
app.get('/api/products/deals/num/', function(req, res, next) {
    var dbo = DBconnection;
    dbo.collection("Top_deals").find({}).toArray(function(err, result){
        if (err) return res.status(500).end(err);
        return res.json(result.length);
    });
});

// ========================================================
//---------------------Feedback---------------------------- 
// ========================================================
app.post('/api/user/feedback/', function(req, res, next){
    if (!('name' in req.body)) return  res.status(404).end("Name is missing.");
    if (!('email' in req.body)) return res.status(404).end("Email is missing.");
    if (!('message' in req.body)) return res.status(404).end("Message is missing.");
    if (!(validator.validate(sanitize(req.body.email)))) return res.status(404).end("enter a valid email address");
    var feedback = {
        name: sanitize(req.body.name),
        email: sanitize(req.body.email),
        message: sanitize(req.body.message)
    }
    var dbo = DBconnection;
    dbo.collection('Feedbacks').insertOne(feedback, function(err, result){
        if (err) return res.status(500).end(err);
        return res.status(200).json("Thankyou for your feedback.");
    })
})

// ========================================================
//-----------------------SERVER---------------------------- 
// ========================================================

// ========================================================
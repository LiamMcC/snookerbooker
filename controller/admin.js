var express = require('express');

var router = express.Router();


var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));

// const { menuMiddleware } = require('./middleware');
// router.use(menuMiddleware);

var flash    = require('connect-flash');
var passport = require('passport');
var db = require('../db');
var Email = require("../coms/email.js");


const multer = require('multer');
const path = require('path');
const sharp = require('sharp')
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
   
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
var upload = multer({ storage: storage })

var LocalStrategy = require('passport-local').Strategy;
var localStorage = require('node-localstorage')
var session  = require('express-session');
var cookieParser = require('cookie-parser');

var bcrypt = require('bcrypt-nodejs');

const saltRounds = 10;


router.use(cookieParser('qwerty')); // read cookies (needed for auth) change the secret 

router.use((req, res, next) => {
  res.locals.cookies = req.cookies;
  next();
});

// required for passport
router.use(session({
	secret: 'r5Fhl2WGKJwXcgueRAhX',
	resave: true,
	saveUninitialized: true,
    merge: true,
    cookie: { maxAge: 1000 * 60 * 60 } // Set this so that sessions time out after whatever time you want currently this is set to 1 hour 
 } )); // session secret
 router.use(passport.initialize());
 router.use(passport.session()); // persistent login sessions
 router.use(flash()); // use connect-flash for flash messages stored in session

 router.use(function (req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
  });


function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
    
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}

function checkMembershipStatus(req, res, next) {
   // && new Date() <= req.user.membership_expiry_date
    if (req.user.membership_status === 'Active' ) {
      next(); // User has an active membership.
    } else {
      res.redirect('/1of1info/Membership');
    }
  }


function acceptCookie(req, res, next) {
  // && new Date() <= req.user.membership_expiry_date
   if (req.user.cookie_status === 'Accepted' ) {
     next(); // User has an active membership.
   } else {
     res.redirect('/1of1info/cookiesneeded');
   }
 }

// Deny Permission for actions that are not allowed

router.get('/deniedpermission', isLoggedIn,function(req, res, next) {
    const currentRoute = req.url;
    res.render('deniedpermission', {currentRoute, user: req.user})
  });


  router.get('/expiredmembership', isLoggedIn,function(req, res, next) {
    const currentRoute = req.url;
    res.render('expiredmembership', {currentRoute, user: req.user})
  });



router.get('/login', function(req, res) {
        const successMessage = req.flash('wrongcombo');
        const currentRoute = req.url; // or any logic to determine the current route
        let sql = 'SELECT * FROM webContent WHERE location = ?';
        let query = db.query(sql,["Login"], (err, result) => {  

		res.render('login', {result, flash: req.flash(), message: successMessage, currentRoute,user: req.user});

        });
	});

	// process the login form
router.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            // get the cart data
            

            
            if (req.body.remember) {
                //  maxAge: 1000 * 60 * 1
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	
	router.get('/signup', function(req, res) {
        const currentRoute = req.url; // or any logic to determine the current route
        let sql = 'SELECT * FROM webContent WHERE location = ?';
        let query = db.query(sql,["Login"], (err, result) => { 
        res.render('register', {result, user : req.user, currentRoute });

        })
	});

	// process the signup form
	router.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	



  // *************** SAMPLING PROFILE ROUTE TO CHECK FOR SUBSCRIPTIONS 


  router.get('/profile', isLoggedIn, function(req, res) {
    const successMessage = req.flash('wrongcombo');
    const currentRoute = req.url;
  
    // SELECT * FROM Messages WHERE (receiver_id = ?) OR (sender_id = ? AND replied_to = ?)
    let sql =
      'SELECT * FROM users WHERE userName = ?; ' +
      'SELECT * FROM profileData WHERE user_id = ?; ' +
      'SELECT userName, summary FROM users ORDER BY Id DESC LIMIT 1; ' +
      'SELECT title, item_id FROM inventItems WHERE createdBy = ?; ' +
      'SELECT * FROM Messages WHERE (receiver_id = ? AND erad_Status = 0) OR (sender_id = ? AND previously_opened = ? ) OR (receiver_id = ? AND previously_opened = ? ); ' +
      'UPDATE users SET membership_status = ? WHERE date_paid < DATE_SUB(NOW(), INTERVAL 8 HOUR);';
  
    let query = db.query(sql, [req.user.username, req.user.Id, req.user.userName, req.user.Id, req.user.Id, req.user.Id, req.user.Id, req.user.Id, "Expired"], (err, result) => {
      if (err) {
        // Handle the error appropriately
      }
  
      // const [userResults, profileResults, latestUserResult, inventItemsResults, messagesResults] = result;
  
      // Continue with rendering the profile page using the obtained results
      res.render('profile', {
        result, user: req.user, currentRoute, message: successMessage 
      });
    });
  });

  // *************** SAMPLING PROFILE ROUTE TO CHECK FOR SUBSCRIPTIONS 


    router.get('/getnewmessages', isLoggedIn,  function(req, res) {
        // Replace this part with your database query to fetch new messages
        // You should send the messages data as JSON, not render the whole page.
        let sql = 'SELECT * FROM Messages WHERE (receiver_id = ? AND erad_Status = 0) OR (sender_id = ? AND previously_opened = ? ) OR (receiver_id = ? AND previously_opened = ? ); ';
        let query = db.query(sql, [req.user.Id, req.user.Id, req.user.Id, req.user.Id, req.user.Id], (err, result) => {
          if (err) {
            // Handle errors
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            // Send the messages data as JSON
            res.json(result);
            
          }
        });
      });

    // ********* Start Messages Be Careful With logic Here 

	router.get('/readmessage/:id', isLoggedIn, checkMembershipStatus, function(req, res) {
        const successMessage = req.flash('wrongcombo');
        const currentRoute = req.url;
        let sql = 'SELECT * FROM Messages WHERE (receiver_id = ? AND message_id = ?) OR (sender_id = ? OR message_id = ?) ORDER BY message_id DESC Limit 1;SELECT * FROM MessageThreads WHERE (receiver_id = ? OR sender_id = ?) AND message_id = ?; update Messages set erad_Status = ?, previously_opened = ? where message_id = ?;SELECT * FROM MessageThreads WHERE (receiver_id = ? OR sender_id = ?) AND message_id = ? ORDER BY thread_id DESC LIMIT 1';
        let query = db.query(sql,[req.user.Id, req.params.id, req.user.Id, req.params.id, req.user.Id, req.user.Id, req.params.id, 1, 0, req.params.id, req.user.Id, req.user.Id, req.params.id], (err,result) => {     
            if (err) {
               
               
              }  

                res.render('readmessage', {result, user: req.user, currentRoute, message: successMessage });    
                });  
    });





	router.post('/messageinventor/:id', isLoggedIn, checkMembershipStatus, function(req, res) {

    const { subject, message } = req.body;
    const fieldsToCheck = [subject, message];
    
    if (fieldsToCheck.some(field => field.includes('<'))) {
      res.redirect('/careful');
    } else {

    


        const successMessage = req.flash('messagesent', "Thank you for sending the message");
        const currentRoute = req.url;
        const currentTimestamp = new Date();
        let sql = 'INSERT INTO Messages (message_subject, sender_id, receiver_id, timestamp) VALUES (?,?,?,?);';
        sql += 'INSERT INTO MessageThreads (message_id, sender_id, receiver_id, message_text, timestamp, sender_name) VALUES (LAST_INSERT_ID(),?,?,?,?,?);';
        
        let query = db.query(sql, [req.body.subject, req.user.Id, req.params.id, currentTimestamp, req.user.Id, req.params.id, req.body.message, currentTimestamp, req.user.userName], (err, result) => {    
     

                res.redirect('/outbox');    
                });  

              }
    });




    router.post('/reply/:id', isLoggedIn,  function(req, res) {
      const { reply } = req.body;
      const fieldsToCheck = [reply];
      
      if (fieldsToCheck.some(field => field.includes('<'))) {
        res.redirect('/careful');
      } else {


        const successMessage = req.flash('messagesent', "Thank you for sending the message");
        const currentRoute = req.url;
        const currentTimestamp = new Date();
        let sql = 'INSERT INTO MessageThreads (message_id, sender_id, receiver_id, message_text, timestamp, sender_name) VALUES (?,?,?,?,?,?);update Messages SET replied_to = ?, read_status_reply = ? , previously_opened = ? WHERE message_id = ?';
      
 
        
        let query = db.query(sql, [req.params.id, req.user.Id, req.body.whoto, req.body.reply, currentTimestamp, req.user.userName, 1, 1,req.body.whoto, req.params.id], (err, result) => {    
     

                res.redirect('/profile');    
                });  

              }
    });




    router.get('/inbox', isLoggedIn, checkMembershipStatus,  function(req, res) {
      const successMessage = req.flash('wrongcombo');
      const currentRoute = req.url;
      // SELECT * FROM Messages WHERE (receiver_id = ?) OR (sender_id = ? AND replied_to = ?)
      let sql = 'SELECT * FROM Messages WHERE receiver_id = ?; ';
      let query = db.query(sql,[req.user.Id], (err,result) => {     
       
           
              res.render('inbox', {result, user: req.user, currentRoute, message: successMessage });    
              });  
  });



  router.get('/offers', isLoggedIn, checkMembershipStatus, function(req, res) {
    const successMessage = req.flash('wrongcombo');
    const currentRoute = req.url;
    // SELECT * FROM Messages WHERE (receiver_id = ?) OR (sender_id = ? AND replied_to = ?)
    let sql = 'SELECT * FROM offers WHERE offerTo = ?;';
    let query = db.query(sql,[req.user.Id], (err,result) => {     
   
         
            res.render('offers', {result, user: req.user, currentRoute, message: successMessage });    
            });  
});


    // ********* End Messages Be Careful With logic Here 

               
    router.get('/publicprofile/:username/:id', isLoggedIn, checkMembershipStatus, function(req, res) {
        const successMessage = req.flash('wrongcombo');
        const currentRoute = req.url;
        let sql = 'select * from users WHERE userName = ?; select * from profileData where user_id = ?; SELECT title, item_id, paragraph1 FROM inventItems where creator_id = ?';
        let query = db.query(sql,[req.params.username, req.params.id, req.params.id], (err,result) => {     
  
             
                res.render('publicprofile', {result, user: req.user, currentRoute, message: successMessage });    
                });  
    });


    router.get('/pastsubscriptions', isLoggedIn,  function(req, res) {
      const currentRoute = req.url;
      let sql = 'SELECT * FROM subscriptions WHERE userName = ? and userId = ? ORDER BY sub_id DESC; ';
      let query = db.query(sql, [req.user.userName, req.user.Id], (err, result) => {
       
          // Send the messages data as JSON
          res.render("pastsubscriptions", {result, user: req.user, currentRoute});
          
       
      });
    });

	

    router.get('/logout', function(req, res, next) {
        
        req.logout(function(err) {
         
          res.redirect('/');
        });
      });


      router.get('/changepassword', isLoggedIn,function(req, res, next) {
        const currentRoute = req.url;
        res.render('changepassword', {currentRoute, user: req.user})
      });


      router.post('/changepassword',isLoggedIn,  function(req, res, next){  // I have this restricted for admin just for proof of concept
        
        let oldP = req.body.oldpassword
        let newP = req.body.newpassword
        let pFind = 'select password from users where userName = ?;'  
        let pcheck = db.query(pFind, [req.user.userName],(err,result) => {
           if (!bcrypt.compareSync(oldP, result[0].password)){
            req.flash('wrongcombo', 'Looks Like you entered the wrong current password!');
            res.redirect('/profile')
           } else {

            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(newP, salt);
            
            Email.passwordResetNotice(req.user.uemail)
           
            let sql = 'update users set password = ? where userName = ?;'  
            let query = db.query(sql, [hash, req.user.userName],(err,result) => {
               
                res.redirect('/logout')
                
            });
           }
            
        });

       });


       router.get('/changeprofilepic', isLoggedIn,function(req, res, next) {
        const currentRoute = req.url;
        res.render('changeprofilepicture', {currentRoute, user: req.user})
      });

       router.post('/changeprofilepic', isLoggedIn, upload.single("image"), async function(req, res, next){  // I have this restricted for admin just for proof of concept
        const { filename: image } = req.file;      
        await sharp(req.file.path)
            .resize(500, 500)
            .jpeg({ quality: 90 })
            .toFile(
                path.resolve(req.file.destination,'resized',image)
            )
            fs.unlinkSync(req.file.path)



        let sql = 'update users set uPice = ? where userName = ?;'  
        let query = db.query(sql, [req.file.filename, req.user.userName],(err,result) => {
           
            res.redirect('/profile')
            
        });

       });



       router.get('/resetpassword', function(req, res, next) {
        const currentRoute = req.url;
        res.render('forgottenpassword', {currentRoute, user: req.user})
      });


       router.post('/changeandresetpassword',  function(req, res, next){  
        
        function makeid(length) {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
              result += characters.charAt(Math.floor(Math.random() * 
         charactersLength));
           }
           return result;
        }
        
        var randomPassword = makeid(32)
        

        let email = req.body.email
        let who = req.body.username
        let pFind = 'select * from users where userName = ?;'  
        let pcheck = db.query(pFind, [who],(err,result) => {

            if(result.length == 0){
                
                
                req.flash('wrongcombo', 'Something looks wrong. Also remember Usernames are case sensitive and emails must be the same as the one you have associateted with your account!');
            res.redirect('/login')
            
            
            } else {

           if (result[0].uemail !== email || result[0].userName != who ){
            req.flash('wrongcombo', 'That Looks Wrong!');
            res.redirect('/login')
           } else {
            Email.rmaiReset(email, randomPassword)
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(randomPassword, salt);
    
            
            let sql = 'update users set password = ? where userName = ?;'  
            let query = db.query(sql, [hash, who],(err,result) => {
              
               req.flash('wrongcombo', randomPassword);
                res.redirect('/login')
                
            });
           }


        }
            
        });

        

       });




       router.post('/changeemail',isLoggedIn,  function(req, res, next){  // I have this restricted for admin just for proof of concept
        
    
         // use the generateHash function in our user model
        let sql = 'update users set uemail = ? where userName = ?;'  
        let query = db.query(sql, [req.body.newemail, req.user.userName],(err,result) => {
           
            res.redirect('/profile')
            
        });
    
       });


       router.get('/editprofile', isLoggedIn,function(req, res, next) {
        const successMessage = req.flash('wrongcombo');
        const currentRoute = req.url;
        let sql = 'select * from profileData WHERE user_id = ?';
        let query = db.query(sql,[req.user.Id], (err,result) => {     
                  
                res.render('editprofile', {result, user: req.user, currentRoute, message: successMessage });    
                });  
    });


    router.post('/editprofile', isLoggedIn,function(req, res, next) {

      const {newemail, summary, allAbout, interests, aboutme, expecting} = req.body;
    const fieldsToCheck = [newemail, summary, allAbout, interests, aboutme, expecting];
    
    if (fieldsToCheck.some(field => field.includes('<'))) {
      res.redirect('/careful');
    } else {


        const somethingMissing = req.flash('This Field Can Not Be Blank');
        
        db.query("SELECT * FROM profileData WHERE userName = ?",[req.user.userName], function(err, rows) {
          if (err)
              return done(err);
          if (!rows.length) {
            let sql = 'update users set uemail = ?, summary = ?, allAbout = ?, role = ? where Id = ?;INSERT INTO profileData (interests , aboutMe , expecting, userName, user_id) VALUES (?,?,?,?,?);'  
            let query = db.query(sql, [req.body.newemail, req.body.summary, req.body.allAbout, req.body.role, req.user.Id, req.body.interests, req.body.aboutme, req.body.expecting, req.user.userName, req.user.Id],(err,result) => {
               
                res.redirect('/profile')
                
            });
          } else {
            let sql = 'update users set uemail = ?, summary = ?, allAbout = ?, role = ? where Id = ?;update profileData set interests = ?, aboutMe = ?, expecting = ? where user_id = ?;'  
            let query = db.query(sql, [req.body.newemail, req.body.summary, req.body.allAbout, req.body.role, req.user.Id, req.body.interests, req.body.aboutme, req.body.expecting, req.user.Id],(err,result) => {
               
                res.redirect('/profile')
                
            });
          
          }

        })
      }
    });


 // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {

        
        done(null, user.Id); // Very important to ensure the case if the Id from your database table is the same as it is here
        
    });

    // used to deserialize the 
    passport.deserializeUser(function(Id, done) {    // LOCAL SIGNUP ============================================================

       db.query("SELECT * FROM users WHERE Id = ? ",[Id], function(err, rows){
            done(err, rows[0]);
            
        });
    });

    // =========================================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

  passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            db.query("SELECT * FROM users WHERE userName = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user

                    const salt = bcrypt.genSaltSync(saltRounds);
                    const hash = bcrypt.hashSync(password, salt);

                    var newUserMysql = {
                        username: username,
                        email: req.body.email,
                        password: hash  // use the generateHash function in our user model
                    };

                    var insertQuery = "INSERT INTO users ( username, uemail, password ) values (?,?,?)";
                   
                    db.query(insertQuery,[newUserMysql.username, newUserMysql.email, newUserMysql.password],function(err, rows) {
                        newUserMysql.Id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true// allows us to pass back the entire request to the callback
            
        },
        function(req, username, password, done) { // callback with email and password from our form
            db.query("SELECT * FROM users WHERE userName = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'Username Or Password Are Wrong.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Username Or Password Are Wrong.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                
                return done(null, rows[0]);
            });
        })
    );








      // ----------------------------- Auth End ------------------------
  
  



  module.exports = router;
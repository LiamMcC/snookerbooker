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
	secret: 'fwegrbryewryertas',
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






// Deny Permission for actions that are not allowed





router.get('/login', function(req, res) {
         

		res.render('login');

       
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
   
        res.render('register', {currentRoute });

   
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
  
    
      res.render('profile', {
       user: req.user, currentRoute 
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
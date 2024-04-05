var express = require('express');

var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));
var db = require('../db');
var Email = require("../coms/email.js");
var flash    = require('connect-flash');
router.use(flash()); // use connect-flash for flash messages stored in session
router.use(require('./user'))
// var Email = require("../coms/email.js");


router.use((req, res, next) => {
  res.locals.cookies = req.cookies;
  next();
});



// function to render the home page
router.get('/',  function(req, res){
  const currentRoute = req.url; // or any logic to determine the current route
  // create title and description
  var title = "Online Pool Hall Booking System" 
  var description = "Online Pool Hall Booking System"
  // render the page and send data for title and description
  console.log("Cookie value:", req.cookies.cookie_consent);
  res.render('home', {title, description, currentRoute});    
  
  });


  // function to render the home page
router.get('/about',  function(req, res){
  const currentRoute = req.url; // or any logic to determine the current route
  // create title and description
  var title = "Online Pool Hall Booking System" 
  var description = "Online Pool Hall Booking System"
  
  // render the page and send data for title and description
  res.render('about', {user: req.user});    
  
  });

  
  router.get('/portfolio',  function(req, res){
    const currentRoute = req.url; // or any logic to determine the current route
    // create title and description
    var title = "Online Pool Hall Booking System" 
    var description = "Online Pool Hall Booking System"
    
    // render the page and send data for title and description
    res.render('portfolio', {user: req.user});    
    
    });
  
    router.get('/services',  function(req, res){
      const currentRoute = req.url; // or any logic to determine the current route
      // create title and description
      var title = "Online Pool Hall Booking System" 
      var description = "Online Pool Hall Booking System"
      
      // render the page and send data for title and description
      res.render('services', {user: req.user});    
      
      });

  
router.get('/contact', function(req, res, err){
  const currentRoute = req.url;
 
    res.render('contact', {user: req.user, currentRoute});

  });


  router.get('/privacy', function(req, res, err){
    const currentRoute = req.url;
   
      res.render('privacy', {user: req.user, currentRoute});
  
    });


  

  router.post('/contact', function(req, res){
         if (req.body.verifybox == "Dublin" || req.body.verifybox == "dublin" || req.body.verifybox == "DUBLIN" ) {

          if (!req.body.fullname || !req.body.email || !req.body.comment) {
            res.redirect('/missingdata')
          } else {
            Email.contactMailForm(req.body.fullname, req.body.email, req.body.comment)
            res.redirect('/thankyou')
          }

          } else {

            res.redirect('/wrongcaptcha')
              
          }


     
    });

    router.get('/missingdata', function(req, res){
      const currentRoute = req.url;
      res.render('missingcontact', {user: req.user, currentRoute});
      });

    router.get('/thankyou', function(req, res){
      const currentRoute = req.url;
        res.render('thankyou', {user: req.user, currentRoute});
      });
    


      router.get('/wrongcaptcha', function(req, res){
        const currentRoute = req.url;

            let sql = 'SELECT * FROM webContent WHERE location ="Wrong"';
            let query = db.query(sql, (err,result) => {
              if(err) {
                res.redirect('/error'); // Redirect to error page
              } else { 
                res.render('wrongcaptcha', {currentRoute});
              }
            });
         
        });
  
// ****** End Email Contact Handlers

// ***************** Cookie

router.post('/acceptCookie', function(req, res) {
console.log("Hello")
  let options = {
      maxAge: 1000 * 60 * 60 * 24 * 30 * 6// would expire after 6 months minutes
      //httpOnly: true, // The cookie only accessible by the web server
    // signed: true // Indicates if the cookie should be signed
  }
 
  res.cookie('cookie_consent', 1, options) // options is optional
  //res.send('')


 
  res.redirect(req.get('referer'));
 //res.redirect('/');
 });


 router.get('/rejectCookie', function(req, res) {

  let options = {
      maxAge: 1000 * 60 * 5// would expire after 90 minutes
      //httpOnly: true, // The cookie only accessible by the web server
    // signed: true // Indicates if the cookie should be signed
  }
 
  res.cookie('cookie_consent', 0 , options) // options is optional
  //res.send('')


 
  res.redirect(req.get('referer'));
 //res.redirect('/');
 });


// ****************** Error Route 

router.get('/servererror', function(req, res){
  //let grandItems = 0
  const currentRoute = req.url;

  let sql = 'SELECT * FROM webcontent WHERE location ="Error"';
  let query = db.query(sql, (err,result) => {
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
      res.render('servererror', {result, user: req.user, currentRoute});
    }
  });
});


router.get('/error', function(req, res){
  //let grandItems = 0
  const currentRoute = req.url;

  let sql = 'SELECT * FROM webContent WHERE location ="Error"';
  let query = db.query(sql, (err,result) => {
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
      res.render('error', {result, user: req.user, currentRoute});
    }
  });
});


router.get('/careful', function(req, res){
  //let grandItems = 0
  const currentRoute = req.url;

  let sql = 'SELECT * FROM webContent WHERE location ="Careful"';
  let query = db.query(sql, (err,result) => {
    
      res.render('careful', {result, user: req.user, currentRoute});
    });
});





  module.exports = router;
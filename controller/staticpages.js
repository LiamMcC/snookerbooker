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
  var title = "Page Title Goes Heres" 
  var description = "Description Goes Here"
  
  // render the page and send data for title and description
  res.render('home', {title, description, currentRoute});    
  
  });


  



  
router.get('/contact', function(req, res, err){
  const currentRoute = req.url;
 
  if(err) {
    res.redirect('/error'); // Redirect to error page
  } else { 
    res.render('contactus', {result, user: req.user, currentRoute, message});
  }
  });


  router.post('/contact', function(req, res){
         if (req.body.verifybox == "Madrid" || req.body.verifybox == "madrid" || req.body.verifybox == "MADRID" ) {

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




// ****************** Error Route 


// ***************** Cookie

router.post('/acceptCookie', function(req, res) {

  let options = {
      maxAge: 1000 * 60 * 5// would expire after 90 minutes
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


  module.exports = router;
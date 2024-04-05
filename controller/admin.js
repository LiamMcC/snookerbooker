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



 router.get('/admin',isLoggedIn, function(req, res) {
  const currentRoute = req.url; // or any logic to determine the current route
  
  function formatDate(date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
      const year = date.getFullYear();
      return `${year}-${month}-${day}`; // Format date as yyyy-mm-dd for SQL
  }
  
  // Get today's date
  const today = new Date();
  
  // Format today's date
  const formattedDate = formatDate(today);
 // console.log("Today's Date:", formattedDate);

var date = new Date()
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
  const year = date.getFullYear();
  var theRightOne = `${year}/${month}/${day}`;
  //console.log("Today's Date Liam Style:", theRightOne);

  
  let sql = 'SELECT id FROM bookings WHERE whatdate >= ? LIMIT 1'; // Get the ID of the first entry for today's date
  db.query(sql, [formattedDate], (err, result) => {  

      if (err) {
          // Handle error
         // console.error(err);
          res.redirect('/error'); // Redirect to error page
      } else {
          const firstId = result[0].id; // Get the ID of the first entry
       //   console.log("The Id " + firstId)
          // Now retrieve all entries where the ID is greater than or equal to the first ID
          let sqlEntries = 'SELECT * FROM bookings WHERE id >= ? and club = ? ORDER BY id DESC';
          db.query(sqlEntries, [firstId, req.user.club], (err, entries) => {
              if (err) {
                  // Handle error
                  //console.error(err);
                  res.redirect('/error'); // Redirect to error page
              } else {
                  res.render('admin', { result: entries, currentRoute, user: req.user });
              }
          });
      }
  });


  let backDays = formattedDate;

// Parse the formatted date string
let dateParts = formattedDate.split('-');
let byear = parseInt(dateParts[0]);
let bmonth = parseInt(dateParts[1]) - 1; // Month is zero-based (0-11)
let bday = parseInt(dateParts[2]);

// Create a Date object with the given date
let currentDate = new Date(byear, bmonth, bday);

// Subtract three days from the current date
currentDate.setDate(currentDate.getDate() - 6);

// Format the new date as 'YYYY-MM-DD'
let sixDaysAgo = currentDate.toISOString().split('T')[0];

console.log("Three days ago:", sixDaysAgo);



  let purgesql = 'UPDATE bookings SET email = ?, username = ?, phone = ? WHERE whatdate < ? and  club = ?'; // Get the ID of the first entry for today's date
  db.query(purgesql, ["oldbooking", "Liamed By Admin", 0000000000, sixDaysAgo, 'J-Macs-Pool-Club'], (err, result) => {
//console.log("Purged")
//console.log(formattedDate)

    })

});






router.get('/your-api-endpoint/:itemId', (req, res) => {
  // Retrieve itemId from request parameters
  const itemId = parseInt(req.params.itemId);
  
  // SQL query to fetch item from bookedslots table
  const sql = `SELECT * FROM bookedslots WHERE bookingId = ?
              `;
  
  // Execute SQL query with itemId as parameter
  db.query(sql, [itemId], (err, results) => {
    if (err) {
      //console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (results.length > 0) {
      // If item is found, send it as JSON response
      res.json(results);
    } else {
      // If item is not found, send 404 Not Found response
      res.status(404).json({ error: 'Item not found' });
    }
  });
});







  



  module.exports = router;
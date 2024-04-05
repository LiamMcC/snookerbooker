var express = require("express"); // call express to be used by the application.
var app = express();

const cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.cookies = req.cookies;
  next();
});

var db = require('./db');
// set the template engine 
app.set('view engine', 'ejs'); 

const path = require('path');

app.use(express.static("views")); 
app.use(express.static("sass")); 
app.use(express.static("sass")); 
app.use(express.static("css")); 
app.use(express.static("images"));  
app.use(express.static("webfonts"));  
app.use(express.static("js")); 
app.use(express.static("style")); 
app.use(express.static("partials")); 
app.use(express.static("uploads")); 
app.use(express.static("uploads/resized")); 

app.use(require('./routes.js'));

// Handling 404 errors
app.use((req, res, next) => {
 res.status(404);
  res.redirect('/error'); // Render a specific 404 page
//   // or
//   // res.json({ error: 'Not Found' }); // Send a JSON response
 });

// // Global error handling
app.use((err, req, res, next) => {
//   console.error('Error:', err);
  res.status(500);
 res.redirect('/servererror'); // Render a general error page
//   // or
//   // res.json({ error: 'Internal Server Error' }); // Send a JSON response
 });

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0" , function(){
    console.log("App is Running ......... Yessssssssssssss!")
  });
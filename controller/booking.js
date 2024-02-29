var express = require('express');

var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());
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
router.get('/tables/:whento', function(req, res){
    const shiftBy = parseInt(req.params.whento); // Convert the parameter to an integer
    
    const today = new Date(); // Get the current date
    let targetDate = new Date(today); // Create a copy of the current date
    
    // Shift the date by the specified number of days
    targetDate.setDate(targetDate.getDate() + shiftBy);

    // Now you can proceed with formatting the date and other operations

    const dd = String(targetDate.getDate()).padStart(2, '0'); // Get the day and pad with leading zero if necessary
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0'); // Get the month (January is 0)
    const yyyy = targetDate.getFullYear(); // Get the year
    
    // Concatenate the components with "/" separator
    const formattedDate = dd + '/' + mm + '/' + yyyy;
    const options = { weekday: 'long' };
    const dayOfWeek = targetDate.toLocaleDateString('en-US', options);

    let sql = ` SELECT * FROM webcontent WHERE location = "Bookings";
                    SELECT * FROM gametables;
                    SELECT * FROM slottimes WHERE daychoice = ?`;
  
    let query = db.query(sql, [dayOfWeek], (err, results) => {
      if(err) {
        throw(err)
        //res.redirect('/error'); // Redirect to error page
      } else { 
        // Since there are multiple queries, results is an array containing the result of each query
    
        const tableData = results[1];
        const siteData = results[0];
        const slotData = results[2];
   
        function getNextDays(startDay) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const startIndex = days.indexOf(startDay); // Get the index of the start day
            const nextDays = [];
            
            // Loop through the next 6 days and add their names to the array
            for (let i = 1; i <= 7; i++) {
                const nextIndex = (startIndex + i) % 7; // Ensure looping within the days array
                nextDays.push(days[nextIndex]);
            }
            
            return nextDays;
        }
        
        // Usage example
        const justNow = dayOfWeek; // Assuming justNow represents the current day of the week
        console.log("Day of the week " + dayOfWeek)
        console.log("New Day Of The Week Style " + new Date().getDay() )
        const dayIndex = new Date().getDay(); // Get the index of the day (0 for Sunday, 1 for Monday, etc.)
const actualDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        console.log("Just Nowe " + justNow )
        console.log("Actual Day Now Liam " + actualDay )
        const nextDays = getNextDays(actualDay);

        res.render('tables', { tableData, siteData, dayOfWeek, formattedDate, nextDays, slotData });
      }
    });
});


// ajax update
router.get('/panelupdate/:whento', function(req, res){
  const shiftBy = parseInt(req.params.whento); // Convert the parameter to an integer
  
  const today = new Date(); // Get the current date
  let targetDate = new Date(today); // Create a copy of the current date
  
  // Shift the date by the specified number of days
  targetDate.setDate(targetDate.getDate() + shiftBy);

  // Now you can proceed with formatting the date and other operations

  const dd = String(targetDate.getDate()).padStart(2, '0'); // Get the day and pad with leading zero if necessary
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0'); // Get the month (January is 0)
  const yyyy = targetDate.getFullYear(); // Get the year
  
  // Concatenate the components with "/" separator
  const formattedDate = dd + '/' + mm + '/' + yyyy;
  const options = { weekday: 'long' };
  const dayOfWeek = targetDate.toLocaleDateString('en-US', options);

  let sql = ` SELECT * FROM webcontent WHERE location = "Bookings";
                  SELECT * FROM gametables;
                  SELECT * FROM slottimes WHERE daychoice = ?`;

  let query = db.query(sql, [dayOfWeek], (err, results) => {
    if(err) {
      throw(err)
      //res.redirect('/error'); // Redirect to error page
    } else { 
      // Since there are multiple queries, results is an array containing the result of each query
  
      const tableData = results[1];
      const siteData = results[0];
      const slotData = results[2];
 
      function getNextDays(startDay) {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const startIndex = days.indexOf(startDay); // Get the index of the start day
          const nextDays = [];
          
          // Loop through the next 6 days and add their names to the array
          for (let i = 1; i <= 7; i++) {
              const nextIndex = (startIndex + i) % 7; // Ensure looping within the days array
              nextDays.push(days[nextIndex]);
          }
          
          return nextDays;
      }
      
      // Usage example
      const justNow = dayOfWeek; // Assuming justNow represents the current day of the week
      const nextDays = getNextDays(justNow);

      res.render('tables', { tableData, siteData, dayOfWeek, formattedDate, nextDays, slotData });
    }
  });
});

// Assuming you're using Express.js
// Function to insert data into the bookings table and return the inserted ID
function insertBooking(username, email, phone, dayOfWeek, date, tableNo) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO bookings (username, email, phone, dayOfWeek, whatdate, tableNo) VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(sql, [username, email, phone, dayOfWeek, date, tableNo], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.insertId); // Return the ID of the inserted row
        }
      });
    });
  }
  
  // Function to insert booked slots for a booking ID
  function insertBookedSlots(bookingId, slotTimes) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO bookedslots (bookingId, slotTime) VALUES ?`;
      const values = slotTimes.map(slotTime => [bookingId, slotTime]);
      db.query(sql, [values], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows); // Return the number of affected rows (successful inserts)
        }
      });
    });
  }
  
  // Route handler for booking
  router.post('/bookings', async (req, res) => {
    try {
      // Extract booking data from the request body
      const { dayOfWeek, formattedDate, tableNumber, timeSlots } = req.body;
      var username = req.body.name
      var email = req.body.email
      var phone = req.body.phone
   
  
      // Insert booking data into the bookings table
      const bookingId = await insertBooking(username, email, phone, dayOfWeek, formattedDate, tableNumber);
  
      // Insert booked slots for the booking ID into the bookedSlots table
      const rowsInserted = await insertBookedSlots(bookingId, timeSlots);
  
      console.log(`${rowsInserted} slot(s) inserted for the booking`);
  
      // Send a response
      res.json({ message: 'Booking information received.' });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
          // Handle duplicate entry error
          console.error('Duplicate entry:', error.message);
          res.status(400).json({ error: 'Duplicate booking entry.' });
      } else {
          console.error('Error inserting data:', error);
          res.status(500).json({ error: 'Failed to insert booking information.' });
      }
  }
  });

  router.get('/xxx/:number', function(req, res){
    const tableNumber = req.params.number;
    const date = req.query.date;
    const day = req.query.day;
    

    // Query the database to retrieve the available time slots for the specified table number, date, and day
    const sql = `SELECT gametime 
    FROM slottimes 
    WHERE daychoice = ? 
    AND gametime NOT IN (
        SELECT slotTime 
        FROM bookedslots 
        INNER JOIN bookings ON bookedslots.bookingId = bookings.id 
        WHERE bookings.dayOfWeek = ? 
        AND bookings.whatdate = ? 
        AND bookings.tableNo = ?
    );`;
    db.query(sql, [day, day, date, tableNumber], (err, results) => {
        if (err) {
            console.error('Error fetching time slots:', err);
            res.status(500).json({ error: 'Failed to fetch time slots. Please try again later.' });
        } else {
            // Extract time slots from the query results
            const timeSlots = results.map(row => row.gametime);
            // Send the time slots as JSON response
            res.json(timeSlots);
        }
    });
});


  
  module.exports = router;
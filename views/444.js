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
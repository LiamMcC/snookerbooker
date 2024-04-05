


// admin with expanded dates
router.get('/newadmin', function(req, res) {
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
    console.log("Today's Date:", formattedDate);
    
    let sql = 'SELECT * FROM bookings WHERE DAY(whatdate) >= ? AND (MONTH(whatdate) > ? OR (MONTH(whatdate) = ? AND YEAR(whatdate) > ?))';
    let query = db.query(sql, [today.getDate(), today.getMonth() + 1, today.getMonth() + 1, today.getFullYear()], (err, result) => {  
        if (err) {
            // Handle error
            console.error(err);
            res.redirect('/error'); // Redirect to error page
        } else {
            res.render('admin', { result, currentRoute, user: req.user });
        }
    });
});


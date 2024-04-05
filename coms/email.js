// vrom caqd gxza iwkr

'use strict';
require('dotenv').config();

const res = require('express/lib/response');
var db = require('../db');
var nodemailer = require('nodemailer');


let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'nowitsbooked@gmail.com',
        pass: process.env.EMAIL_CODE
    }
});










module.exports = class Email {

// *************************** Booking Confirmed Mail To Be Configured
// nowitsbooked@gmail.com 

// Email.bookingConfirmed('me@liammccabe.ie', timeSlots, bookingId,  dayOfWeek, formattedDate, tableNumber, refstring)
static bookingConfirmed(xxemail, timeSlots, bookingId,  dayOfWeek, formattedDate, tableNumber, refstring, club) {
    var mailOptions = {
      from: 'Booking Confirmed (BookItNow.Fun) <nowitsbooked@gmail.com>',
      replyTo: 'nowitsbooked@gmail.com',
      to: xxemail,
      subject: 'Booking Confirmed',
      html: `
      <div style="background-color: #f2f7ff; padding: 20px; font-family: Arial, sans-serif;" text-align:center;>
        <h2 style="color: #3498db; text-align: center; margin-bottom: 10px;">Booking Confirmed ${club}</h2>
        <p style="color: #555; font-size: 16px; margin-bottom: 10px;">You have just successfully booked a table on BookItNow.fun for ${club}</p>
        <p style="font-size: 16px; margin-bottom: 10px;">You have booked Table No ${tableNumber} for the following slots:</p>
        <div style="display: flex; flex-wrap: wrap;">
  ${timeSlots.map(slot => `
    <button style="background-color: #3498db; color: white; border: none; padding: 10px 20px; margin: 5px; font-size: 16px; cursor: pointer; text-decoration:none;">
      ${slot}
    </button>
  `).join('')}
</div>
        <p style="font-size: 16px; margin-bottom: 10px;">Your booking reference is: ${bookingId}, for ${dayOfWeek} ${formattedDate}</p>
        <p style="font-size: 16px; margin-bottom: 10px;">To cancel this booking <a href="192.168.0.15:3000/cancel/${refstring}" style="color: #3498db; text-decoration: none;">click here</a></p>
      </div>
      `,
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }







	


   // ********** Contact Form Email

   static contactMailForm(name, email, comment) {

    var mailOptions = {
      from: 'Contact Us (BookItNow.Fun) <nowitsbooked@gmail.com>',
      replyTo: email,
		  cc: [email],
      to: 'me@liammccabe.ie',
      subject: 'BookItNow.Fun Contact',
    
      html: `
      <div style="background-color: #f2f7ff; padding: 20px;">
        <h2 style="color: #3498db;">New Contact Notification</h2>
        <p style="color: #555;"> Sender: ${name}.</p>
        <p style="color: #555;">${comment}</p>
        <p style="color: #555;"> Sender Email Address: ${email}.</p>
      </div>
    ` 
    };
    
    // Remove these console logs before production
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(" A Wee Problem " + error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    
 
   }  



   static rmaiReset(xxemail, newRandomPword) {

    var mailOptions = {
      from: 'me@liammccabe.ie', // this is your websites email address
      replyTo: 'me@liammccabe.ie', // set this to an email you will see if the user needs to reply to a reset password email
      to: xxemail,
      subject: 'Reset Password on 1 Of 1',
      
	  html: `<html><head>
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    </head><body class="w3-light-grey">  
    <header class="w3-container w3-center w3-padding-48 w3-white"><h1 class="w3-xxxlarge">
    <b><a href="https://www.1of1.ie" style="text-decoration: none;">1OF1.IE</a></b></h1>
    <h6>Research <span class="w3-tag">Agency</span></h6></header>
    <header class="w3-display-container w3-wide" id="home">
    <img class="w3-image" src="https://www.win.ie/images/fullvictory.jpg" alt="research is everything" width="1600" height="1060"><div class="w3-display-left w3-padding-large">
    <h1 class="w3-text-white">Reset Email Request</h1></div></header> <div class="w3-container w3-white w3-margin w3-padding-large"><div class="w3-justify"> <div class="w3-white w3-margin"> 
    <div class="w3-container w3-padding w3-black"><h4>What Next?</h4></div>
    <div class="w3-container w3-large w3-padding">
    <p>As you have requested a reset password for 1of1.ie we have reset it for you. Your temporary password is ' + newRandomPword + ' We recommend you change this through your profile when you log back in here 
    <a href="https://www.1of1.ie/login" style="text-decoration: none;">1of1.ie</a>.</p><p>If you did not request this email please reply immediately to this email and inform us what happened. Also immediately go to our website and reset your password again, 
    Thank you for using <a href = "https://1of1.ie" style="text-decoration:none;">1of1.ie</a></p></div></div></div></div><footer class="w3-container w3-dark-grey" style="padding:32px"><div class="w3-row "> <div class="w3-center"><p>Thank You, The 1of1.ie Team</p></div></div></footer></body></html>`
    };
    
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

   }  


   static passwordResetNotice(xxemail) {
    var mailOptions = {
      from: 'me@liammccabe.ie', // this is your websites email address
      replyTo: 'me@liammccabe.ie', // set this to an email you will see if the user needs to reply to a reset password email
      to: xxemail,
      subject: '1 Of 1 Password Has Been Reset Through Your Profile',
      html: `
      <div style="background-color: #f2f7ff; padding: 20px;">
        <h2 style="color: #3498db;">Password Reset Confirmation</h2>
        <p style="color: #555;">You have just reset your password on 1of1.ie. If you did not request this change, please contact us immediately.</p>
      </div>
    `
	  };
    
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

   }  




 



   static adminOrderNotice(xxemail) {
    var mailOptions = {
      from: 'me@liammccabe.ie', // this is your websites email address
      replyTo: 'me@liammccabe.ie', // set this to an email you will see if the user needs to reply to a reset password email
      to: xxemail,
      subject: 'Ab order has been placed',
      text: "An order has been placed and this email needs to be customised to send to the business"
	  };
    
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

   }  
// *************************** Order Confirmed Mail To Be Configured



 
}




 







// Gmail

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//   host: 'smtp.gmail.com',
//   auth: {

   
//     user: "PUT YOUR USER HERE", 
//     pass: "PUT YOUR PASSWORD HERE",
//   }
// });
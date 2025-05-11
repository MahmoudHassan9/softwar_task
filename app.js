const express  = require("express") //import package
const app = express()// execute package
const path = require('path')//is a built-in Node.js module for working with file and directory paths.
const route=require("./routes/roomRoutes");
const userRoute=require("./routes/userRoutes");
const cors=require("cors");
const mongoose=require("mongoose");
const errorHandler=require("./util/error-handler");
const bookingRoute=require('./routes/bookingRoutes');
const helmet = require("helmet"); 
require("dotenv/config");
const rateLimit = require('express-rate-limit');

// Apply to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply to all routes
app.use(limiter);

// to call our html page
//any files inside the public directory an be accessed directly in the browser.
app.use(express.static(path.join(__dirname, 'public')))
/*express.static() is a middleware function in Express.js that 
serves static files such as HTML, CSS, JavaScript, and images.*/
app.get('/',(req,res)=>{
    /*sends the index.html file located in 
    the public directory to the client and ensure that the correct path is sent */
    res.sendFile(path.join(__dirname,'public', 'index.html'))
})



app.use(helmet());

app.use(cors());

//middleware 
app.use(express.json()); // ✅ This is required to parse JSON requests

app.use('/posts', ()=>{ // example => we can use this to check user authentication when you enter the home page
    console.log("this is a middleware running")
})

app.use('/rooms',route);
app.use('/users',userRoute);
app.use('/bookings',bookingRoute)
app.use(errorHandler);
// routes
// '/' => the path (root)
app.get('/', (req,res)=>{ // post, patch, delete
    res.send("we are on home")
})
//'/posts' changes the path
app.get('/posts', (req,res)=>{ // post, patch, delete
    
    res.send("we are on posts")
})

mongoose.connect(process.env.CONNECTION_STRING)
.then(()=>{
    console.log("connected successfully");
})
.catch((err)=>{
    console.log(err);
})
// start lestining to the server

if (process.env.NODE_ENV !== 'test') {
app.listen(3000,()=>{
    console.log("started successfully");
   
})
}
module.exports=app
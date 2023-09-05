
const express = require("express");
const path=require("path");
const app = express();
const hbs = require ("hbs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const session = require('express-session');
// const crypto = require('crypto');
 const PORT = 8001;


const port = process.env.PORT || 8001;

// // Generate a random secret key
// const secretKey = crypto.randomBytes(64).toString('hex');

// // Use the generated secret key in your express-session configuration
// app.use(session({
//   secret: secretKey,
//   resave: true,
//   saveUninitialized: true
// }));

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");
 
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path))
app.set("view engine","hbs") ;   //setting viewengine it will know that we are using handle bars
app.set("views", template_path);     //we are telling the express application to visit the root folder tempalte to get vw
hbs.registerPartials(partials_path);

mongoose.connect("mongodb://localhost:27017/scholarship",{useNewUrlParser:true , useUnifiedTopology:true});
var db= mongoose.connection;

db.on('error',()=>console.log("error in connecting to database"));
db.once('open',()=>console.log(" connecting to register database"));



app.get("/" , (req,res) => {
      res.render("index")
});

app.get("/" , (req,res) => {
  res.set({
    "Allow-access-Allow-Origin": '*'
  })
  return res.redirect("index");
})

app.get("/index" , (req,res) => {
  res.render("index")
});

app.get("/aboutus" , (req,res) => {
  res.render("aboutus")
});

app.get("/undergraduate", (req,res) => {
  res.render('undergraduate');
});

app.get("/postgraduate", (req,res) => {
  res.render('postgraduate');
});

app.get("/faq", (req,res) => {
  res.render('faq');
});

// --------------------------------REGISTER PART-------------------------------------------------
app.get("/register", (req,res) => {
  res.render('register');
});

const registrationSchema = new mongoose.Schema({
  firstname: String,
  email: String,
  password: String,
   confirmpassword:String,
   phone:String,
   gender:String,
   age:String
});

const Registration = mongoose.model('Registration', registrationSchema);


 app.post("/register", async (req,res) => {
  try{
    // console.log(req.body.firstname);
    console.log("Request Body:", req.body);
    
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;

    if(password === cpassword){
        // create data
   const newRegistration = new Registration({
    firstname:req.body.firstname,
    email:req.body.email,
    password:req.body.password,
    cpassword:req.body.confirmpassword,
    phone:req.body.phone,
    gender:req.body.gender
   })
   await newRegistration.save();
    console.log("Registration record inserted successfully");
    return res.redirect("index");
 }
    else{
       res.send("password are not matching");
    }
}catch (error) {
  console.error("Error inserting registration record:", error);
  return res.status(500).send("Error registering user");
}
});


// ------------------------------------LOGIN PART--------------------------------------------------

app.get("/login", (req,res) => {
    res.render('login');
 });
 
 app.post("/login", async(req,res) => {
   try{
       const email = req.body.email;
       const password = req.body.password;

       const useremail = await Registration.findOne({email:email});
        console.log(useremail)

       if(useremail.password === password)
       {
        req.session.user = useremail;
         res.status(201).render("index");
       }
       else{
         res.send("pass is not mathing");
       }
           
      //   console.log(`${email} and password is ${password}`)

   }catch(error){
     res.status(400).send("invalid email");
    }
});

// -------------------------------------APPLICATION PART------------------------------------------

app.get("/application", (req,res) => {
  res.render('application');
});
// app.get('/application', (req, res) => {
//   if (req.session.user) {
//     res.render('application');
//   } else {
//     res.redirect('/login');
//   }
// });


const applicationSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  phone: String,
  college:String,
  category:String,
  course:String,
   fees:String,
   percentage10:String,
   percentage12:String
});

const Application = mongoose.model('Application', applicationSchema);

app.post("/application", async (req,res) => {
  try {
    console.log("Request Body:", req.body);

    const newApplication = new Application({
      // create data
   firstname:req.body.firstname,
   lastname:req.body.lastname,
   email:req.body.email,
   phone: req.body.phone,
   college: req.body.college,
   category:req.body.category,
   course:req.body.course,
   fees:req.body.fees,
   percentage10:req.body.percentage10,
   percentage12 : req.body.percentage12
  });

  
await newApplication.save();
    console.log("Application record inserted successfully");
    return res.redirect("index");
  } catch (error) {
    console.error("Error inserting application record:", error);
    return res.status(500).send("Error submitting application");
  }
});


app.listen(port, () => {
  console.log(`Server is running at port no ${port}`);
});
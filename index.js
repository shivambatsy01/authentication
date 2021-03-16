const express=require('express')
const app=express()
const path=require('path')
const mongoose=require('mongoose')
const session=require('express-session')
const users=require('./schema')
const bodyparser=require('body-parser')
var cookieParser = require("cookie-parser");
var morgan = require("morgan");
const { Cookie } = require('express-session')
const cookie=session.cookie;


app.set('view engine', 'ejs')
app.set('views',path.join(__dirname,'views'))
app.use((bodyparser.urlencoded({ extended: true})))
app.use(cookieParser())

//this will fire for every request to the server
app.use(session({ 
  
    key: "myuser",
    secret: 'my_Secret_Key', 
    resave: false, 
    saveUninitialized: true,
    cookie :{
        expires:600000,
    }
}))

// app.use((req, res,) => {
//     if (!req.cookies.user && req.session.user) {
//       res.redirect('/welcome')
//     }
//   });


var sessionchecker = (req,res,next) => {
    if(!req.session.user  &&  !req.cookies.user){
        res.redirect('/welcome');
    }
    else{
        next();
    }
}



// to use session:
//create a session at login time and stores its session id;
// while logging out from the session: delete the session using that session id and alse delete that session id from database
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





// mongoose.connect('mongodb+srv://batsy01:Iambatman@cluster0.lxf5a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
//     useNewurlParser : true, useUnifiedTopology : true,

// }).then(() => console.log("database connected"));


let user=[];

app.get('/',(req,res)=>{
res.render('index')
console.log(req.session)
console.log(req.sessionID)
})



app.get('/reg',(req,res)=> {
    res.render('reg');
    console.log(req.session)
    console.log(req.sessionID)
})






//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.post('/reg',(req,res)=> {

    let password=req.body.password
    let cpassword=req.body.cpassword
    let email=req.body.email

    var err;

    if(!email || !password || !cpassword){
        err='please fill all the fields'
        res.render('reg',{'err' : err});
    }

    else if(password!=cpassword){
        err='password not matched'
        res.render('reg',{'err' : err, 'email' : email });

    }

    else{
        var already_taken=user.find(function(post,index){
            if(post.email == email)
            return true;
        })
        
        if(already_taken){
            err='email already taken/Try with another';
            res.render('reg',{"err": err})

        }

        else{
            user.push({number: user.length + 1, 
                id: req.body.email,
                email : req.body.email,
                password : req.body.password, 
                cpassword: req.body.cpassword})

            console.log("registered: " , user)
            console.log(req.sessionID)
            res.redirect('/success');
        }
        

        //
        //
        // mongoDB data saving method
        //
        // if(err='undefined'){
        //     users.findOne   ({ email : email}, function(err,data) {
        //         if(err) throw err;
        //         if(data){
        //             console.log('user exists');
        //             err='user already exists on this email';
        //             res.render('reg',{'err': err, 'email': email})
        //         }
        //         else{
        //             users({
        //                 email,
        //                 id,
        //                 password
        //             }).save((err,data)=>{
        //                 if(err) throw err;
        //                 res.redirect('/success');})
        //         }
        //     });
        // }
    }

    // res.redirect('/success')
})



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




app.get('/success',(req,res)=>{
    res.render('success')
    console.log('session is:  ', req.sessionID)
    console.log('cookie is: ', req.cookie)
})





app.post('/login',(req,res) => {
    var email=req.body.email;
    var password= req.body.password;
    var err;
    let found = false;
    console.log("post login request, match email, password")
    user.find(function(post,index){

        if(post.email == email ){
            console.log('trying to login with credentials:  ')
            console.log('email entered: ', post.email, '  saved pass: ', post.password, '  entered pass: ', password)

            if(post.password!=password){
                err='password is not correct';
                res.render('login',{'err': err})
            }

            else{
                found = true;
                var name=post.email;
                var session_name=req.session;
                var session_id=req.sessionID;
                console.log('session login: ')
                console.log(session_name);
                console.log(session_id);
                console.log('cookie is: ', req.cookie)
                user[index]['session_id']=session_id;
                console.log("logged in: ", user);

                // session_db.push({id:session_id, username: email, session_name : session_name})
                // console.log(session_db);

                // var session_name=req.session.name
                // console.log(req.session)
                // console.log(req.session.id)
                // console.log(req.sessionID)

                req.session.autheticated = true;
                console.log("set authenticated")
                res.redirect('/welcome');
                // res.render('welcome',{"name": name})
                

            }
        }
    })
    if(!found){
        err= 'email not regisered/Please check again';
        res.render('login',{'err': err});
    }

})




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




app.get('/welcome',(req,res) => {
    //here check session database
    //here is the catch
    console.log("welcome page request")
    if(req.session && req.session.autheticated === true){
        res.render('welcome')
    }
    else{
        res.redirect('/login')
    }
})


app.get('/login',(req,res)=>{
    console.log("login get request")
    // if session there then take to dashboard else render login page
    if(req.session && req.session.autheticated === true){
        // take to dashboard
        res.render('welcome');
    }
    else{
        // session not exist
        res.render('login');
    }
})



app.get('/logout',(req,res)=>{

    console.log('sesson to be logged out: ')
    console.log(req.sessionID)
    console.log(req.cookie)
    // if session exist then destroy session.. else simply take to home page
    if(req.session && req.session.autheticated === true){
        req.session.destroy();
    }
    res.redirect('/login');
})


const port=80;
app.listen(port,()=>
{
    console.log('listening on port ',port);
})

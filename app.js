//Imports

// Express Packages
const express = require('express');
const path = require('path');
const app = express()
const bodyParser = require('body-parser');
const random = require('randomstring');
const flash = require('connect-flash');
require('dotenv').config()

// DB packages
const conn = require('./db');
const bcrypt = require('bcrypt');
const middleware = require('./middlewares/middleware');

// Auth packages
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MySQLStore = require('express-mysql-session')(session);
const options = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

var sessionStore = new MySQLStore(options);
app.use(cookieParser());

// Route Packages
const indexRoutes = require('./routes/index-routes');
const driverRoutes = require('./routes/dashboard-routes/driver-routes');
const vehicleRoutes = require('./routes/dashboard-routes/vehicle-routes');
const routeRoutes = require('./routes/dashboard-routes/route-routes');

//App Configs
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Auth configs
app.use(session({
    key: 'session_cookie_name',
    secret: random.generate(),
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user_id, done) {
    done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
    done(null,user_id);
});

passport.use(new LocalStrategy(
    (username, password, done) => {
        let query = `select * from users where username='${username}';`;
        conn.query(query,(err,result,fields)=>{
            if(result.length === 0)
                return done(null,false);   
            else{
                const hash = result[0].PASSWORD;
                bcrypt.compare(password,hash,(err,response)=>{
                    if(response == true){
                        session.passport = username;
                        return done(null,true);
                    }
                    else{
                        return done(null,false);
                    }
                });
            }
        });
    }
));

app.use(flash());

// Routes config
app.use(indexRoutes);
app.use(driverRoutes);
app.use(vehicleRoutes);
app.use(routeRoutes);

// Middleware
let isActive = () => {
    return (req,res,next)=>{
        conn.query(`select STATUS from users where username= '${session.passport}';`,(err,result,fields)=>{
            if(result[0].STATUS === 1) return next();
            else
            {
                req.logout();
                req.session.destroy();
                res.redirect('/');
            }
        });
    }
}

// User Routes
app.get('/dashboard-users-add',middleware.isLoggedIn(),isActive(),(req,res)=>{
    conn.query(`SELECT ROLE FROM users where username='${session.passport}';`,(err,result,fields)=>{
        if(result[0].ROLE === 1)
        {
            let query = `select id,short_name from institute;`;
            conn.query(query,(err,result,fields)=>{
                res.render('dashboard/user/users-add',{
                    title: 'user',
                    ins: result,
                    success: req.flash('success'),
                    failure: req.flash('failure')
                });
            });
        }
        else{
            req.flash('failure','You are not authorized to access this page');
            res.redirect('/dashboard-vehicles-add');
        }
    });
});

app.post('/users-add',(req,res)=>{
    let x = req.body.user;
    conn.query(`select username from users where username='${x.username}';`,(err,result1,fields)=>{
        if(result1.length === 0){
            bcrypt.hash(x.password, 10, function(err, hash) {
                let query = `insert into users (name,username,role,email,contact,institute_id,aadhar,password,status) values('${x.name}','${x.username}','${x.role}','${x.email}','${x.contact}','${x.institute}','${x.aadhar}','${hash}','${x.status}');`
                conn.query(query,(err,result,fields)=>{
                
                    if(err)    throw(err);
                    conn.query('SELECT LAST_INSERT_ID() as  user_id;',(error,result,fields)=>{
                        if(error) throw error;
        
                        const user_id = result[0];
                        req.login(user_id,(err)=>{
                            if(err) console.log(err);
                        });
                        req.logout();
                    });
                });
            });
            req.flash('success','User added successfully');
            res.redirect('/dashboard-users-add');
        }
        else{
            req.flash('failure','Duplicate Entry. Please use a different username.');
            res.redirect('/dashboard-users-add');
        }
    });
});

app.get('/dashboard-users-edit',middleware.isLoggedIn(),(req,res)=>{
    conn.query(`SELECT ROLE FROM users where username='${session.passport}';`,(err,result,fields)=>{
        if(result[0].ROLE === 1)
        {
            let query = `select id,short_name from institute;`;
            conn.query(query,(err,result,fields)=>{
                res.render('dashboard/user/users-edit',{
                    title: 'user',
                    ins: result,
                    success: req.flash('success'),
                    failure: req.flash('failure')
                });
            });
        }
        else
        {
            req.flash('failure','Duplicate Entry. Please use a different username.');
            res.redirect('/dashboard-users-add');
        }
    });
});

app.post('/edit-user',(req,res)=>{
    let x = req.body;
    let query = `SELECT * FROM users WHERE username=${x.username};`;
    conn.query(query,(err,result,fields)=>{
        if(JSON.stringify(result) === JSON.stringify([]))
        {
            req.flash('failure','User not found.');
            res.redirect('/dashboard-users-edit');
        }
        else
        {
            conn.query(`DELETE FROM users WHERE username='${x.username}';`,(err,result,fields)=>{

            });
            bcrypt.hash(x.password, saltRounds, function(err, hash) {
                let query = `insert into users (name,username,role,email,contact,institute_id,aadhar,password,status) values('${x.name}','${x.username}','${x.role}','${x.email}','${x.contact}','${x.institute}','${x.aadhar}','${hash}','${x.status}');`
                conn.query(query,(err,result,fields)=>{
                    if(err) {
                        console.log(err);
                    }
                    else{
                        req.flash('success','User updated successfully');
                        res.redirect('/dashboard-users-edit');
                    }
                });
            });
        }
    }); 
});

app.get('/dashboard-users-view',middleware.isLoggedIn(),(req,res)=>{
    conn.query(`SELECT ROLE FROM users where username='${session.passport}';`,(err,result,fields)=>{
        if(result[0].ROLE === 1)
        {
            let query = `select * from users`;
            conn.query(query,(err,result,field)=>{
                if(err){
                    console.log(err)
                    res.redirect('/dashboard-users-add');
                }
                else{
                    res.render('dashboard/user/users-view',{
                        title: 'user',
                        result: result,
                        role: ['Operator','Admin'],
                        ins: ['Sistec-GN','Sistec-ER','SPS-GN','SPS-SN','SPS-RN','SPS-RB'],
                        status:['Inactive','Active']
                    });
                }
            })
        }
    });
});

// Serve
app.listen(process.env.PORT || 3000, ()=>{
    console.log('App listening to port 3000');
});
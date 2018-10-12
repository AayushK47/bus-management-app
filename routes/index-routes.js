const express = require('express');
const router = express.Router();
const passport = require('passport');
const conn = require('../db');
const middleware = require('../middlewares/middleware');

router.get('/',(req,res)=>{
    let query = `select id,short_name from institute;`;
    conn.query(query,(err,result,fields)=>{
        res.render('search',{
            title: 'home',
            error: false,
            tab: false,
            ins: result
        });
    });
});

router.post('/',(req,res)=>{
    let ins;
    conn.query(`select id,short_name from institute;`,(err,result,fields)=>{
        ins = result;
        if(req.body.routeno === '' && req.body.stopname === ''){
            res.render('search',{
                title: 'home',
                error: 'Enter Route Number or Stop Name',
                tab: false,
                ins: ins
            });
        }
        else if(req.body.routeno !== '' && req.body.stopname === '')
        {
            let query1 =    `SELECT drivers.route_no,stop_name,NAME,contact,timing 
                            FROM drivers JOIN routes 
                            WHERE routes.route_no = ${req.body.routeno} and routes.route_no = drivers.route_no AND drivers.institute_id=routes.institute_id`;
            conn.query(query1,(err,result,fields)=>{
                res.render('search',{
                    title: 'home',
                    error: false,
                    tab: result,
                    dtype: 1,
                    ins: ins
                });
            });
        }
        else
        {
            let stopname = req.body.stopname.split();
            let query2 =    `SELECT routes.route_no, routes.stop_name,drivers.NAME,drivers.contact,routes.timing 
                            FROM routes JOIN drivers
                            WHERE routes.aadhar= drivers.aadhar AND routes.institute_id='1' AND routes.stop_name LIKE '%${stopname[0]}%'`;
            let query3 =    `SELECT routes.route_no, routes.stop_name,drivers.NAME,drivers.contact,routes.timing
                            FROM routes JOIN drivers
                            WHERE routes.aadhar = drivers.aadhar AND routes.institute_id = '${req.body.institute}' AND 
                            stop_name LIKE '%${stopname}%' ORDER BY routes.timing;`;
            
            
            if(req.body.routeno === ''){
                conn.query(query2,(err,result,fields)=>{
                    res.render('search',{
                        title: 'home',
                        error: false,
                        tab: result,
                        dtype: 2,
                        ins:ins
                    });
                });
            }
            else{
                conn.query(query3,(err,result,fields)=>{
                    res.render('search',{
                        title: 'home',
                        error: false,
                        tab: result,
                        dtype: 2,
                        ins: ins
                    });
                });
            }
        }
    });
});

router.get('/login',(req,res)=>{
    
    res.render('login',{
        title: 'login',
        error: req.flash(),
        success: req.flash('error')
    });
});

router.post('/login',passport.authenticate('local',{
    successRedirect: '/dashboard-users-add',
    failureRedirect: '/login'
}));

// logout route
router.get('/logout',middleware.isLoggedIn(),(req,res)=>{
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
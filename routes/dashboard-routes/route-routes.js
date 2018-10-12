const express = require('express');
const router = express.Router();
const conn = require('../../db');
const middleware = require('../../middlewares/middleware');

router.get('/dashboard-routes-add',middleware.isLoggedIn(),(req,res)=>{
    let query = `select id,short_name from institute;`;
    conn.query(query,(err,result,fields)=>{
        let resu = result
        conn.query(`select route_no from vehicles;`,(err,result,fields)=>{
            let res1 = result
            conn.query(`select aadhar,name,contact from drivers;`,(err,result,fields)=>{
                res.render('dashboard/route/routes-add',{
                    title: 'routes',
                    ins: resu,
                    rouno: res1,
                    drive: result,
                    success: req.flash('success'),
                    failure: req.flash('failure')
                });
            });
        });
    });
});

router.post('/add-route',middleware.isLoggedIn(),(req,res)=>{
    let x=req.body.route;
    let query = `insert into routes (institute_id,city,route_no,stop_name,timing,aadhar) values('${x.institute}','${x.city}','${x.routeno}','${x.stop}','${x.timing}','${x.aadhar}');`;
    conn.query(query,(err,result,field)=>{
        if(err)
        {
            console.log(err);
            req.flash('failure','Duplicate entry! Please try again.');
            res.redirect('/dashboard-routes-add');
        }
        else
        {
            req.flash('success','Route added successfully!');
            res.redirect('/dashboard-routes-add');
        }
    });
});

router.get('/dashboard-routes-edit',middleware.isLoggedIn(),(req,res)=>{
    let query = `select id,short_name from institute;`;
    conn.query(query,(err,result,fields)=>{
        let resu = result;
        conn.query(`select route_no from vehicles;`,(err,result,fields)=>{
            let res1 = result;
            conn.query(`select aadhar,name,contact from drivers;`,(err,result,fields)=>{
                res.render('dashboard/route/routes-edit',{
                    title: 'routes',
                    ins: resu,
                    rouno: res1,
                    drive: result,
                    success: req.flash('success'),
                    failure: req.flash('failure')
                });
            });
        });
    });
});

router.post('/edit-route',(req,res)=>{
    x = req.body;
    let query = `select * from routes where institute_id='${x.institute}' and route_no='${x.routeno}' and stop_name='${x.stopname}';`;
    conn.query(query,(err,result,fields)=>{
        console.log(result);
        console.log(err);
        if(JSON.stringify(result) === JSON.stringify([]))
        {
            console.log(result);
            console.log('not found')
            req.flash('failure','Route not found. Please try again');
            res.redirect('/dashboard-routes-edit');
        }
        else
        {
            conn.query(`DELETE FROM routes where institute_id='${x.institute}' and route_no='${x.routeno} and ${x.stopname}';`,(err,result,fields)=>{

            });
            let query = `insert into routes (institute_id,city,route_no,stop_name,timing,aadhar) values('${x.institute}','${x.city}','${x.routeno}','${x.stopname}','${x.timing}','${x.aadhar}');`;
            conn.query(query,(err,result,fields)=>{
                if(err){
                    console.log(err);
                    req.flash('failure','Duplicate entry! Please try again.');
                    res.redirect('/dashboard-routes-add');
                }
                else{
                    req.flash('success','Route updated successfully!');
                    res.redirect('/dashboard-routes-edit');
                }
            });
        }
    });
});

router.get('/dashboard-routes-view',middleware.isLoggedIn(),(req,res)=>{
    let query = `select * from routes;`;
    conn.query(query,(err,result,field)=>{
        let ress1=result;
            res.render('dashboard/route/routes-view',{
                title: 'routes',
                result: result,
                ins: ['SISTec-GN','SISTec-E/R','SPS-GN','SPS-SN','SPS-RN']
        });
    });
});

router.get('/dashboard-routes-del',middleware.isLoggedIn(),(req,res)=>{
    let query = `select id,short_name from institute;`;
    conn.query(query,(err,result,fields)=>{
        let resu = result;
        conn.query(`select route_no from vehicles;`,(err,result,fields)=>{
            res.render('dashboard/route/routes-del',{
                title: 'routes',
                rouno: result,
                ins: resu,
                success: req.flash('success'),
                failure: req.flash('failure')
            });
        });
    });
});

router.post('/del-route',middleware.isLoggedIn(),(req,res)=>{
    let query = `DELETE FROM routes WHERE institute_id='${req.body.institute}' and stop_name='${req.body.stopname}' and route_no='${req.body.routeno}'`;
    conn.query(query,(err,result,fields)=>{
        if(result.affectedRows <= 0 )
        {
            req.flash('failure','Route not found. Please try again.');
            res.redirect('/dashboard-routes-del');
        }
        else
        {
            req.flash('success','Route deleted successfully');
            res.redirect('/dashboard-routes-del');
        }
    });
});

module.exports = router;
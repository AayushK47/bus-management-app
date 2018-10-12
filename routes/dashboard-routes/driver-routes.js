const express = require('express');
const router = express.Router();
const conn = require('../../db');
const middleware = require('../../middlewares/middleware');

// driver routes
router.get('/dashboard-driver-add',middleware.isLoggedIn(),(req,res)=>{
    let query = `select id,short_name from institute;`;
    conn.query(query,(err,result,fields)=>{
        res.render('dashboard/driver/driver-add',{
            title: 'driver',
            ins: result,
            success: req.flash('success'),
            failure: req.flash('failure')
        });
    });
});

router.post('/add-driver',middleware.isLoggedIn(),(req,res)=>{
    let x = req.body.driver;
    let query = `insert into drivers (name,contact,route_no,dl_number,institute_id,aadhar,status) values('${x.name}','${x.contact}','${x.rno}','${x.dlno}','${x.institute}','${x.aadhar}','${x.status}');`;
    conn.query(query,(err,result,fields)=>{
        if(err)
        {
            req.flash('failure','Duplicate entry! Please try again.');
            res.redirect('/dashboard-driver-add');
        }
        else
        {
            req.flash('success','Driver added successfully');
            res.redirect('/dashboard-driver-add'); 
        }
    });
});

router.get('/dashboard-driver-edit',middleware.isLoggedIn(),(req,res)=>{
    let query = `select id,short_name from institute;`;
    conn.query(query,(err,result,fields)=>{
        res.render('dashboard/driver/driver-edit',{
            title: 'driver',
            ins: result,
            success: req.flash('success'),
            failure: req.flash('failure')
        });
    });
});

router.post('/edit-driver',(req,res)=>{
    let x = req.body;
    let query = `SELECT * FROM drivers WHERE aadhar='${x.aadhar}';`;
    conn.query(query,(err,result,fields)=>{
        console.log(result);
        if(JSON.stringify(result) === JSON.stringify([]))
        {   
            req.flash('failure','Driver not found');
            res.redirect('/dashboard-driver-add'); 
        }
        else
        {
            conn.query(`DELETE FROM drivers WHERE aadhar='${x.aadhar}';`,(err,result,fields)=>{

            });
            let query = `insert into drivers (name,contact,route_no,dl_number,institute_id,aadhar,status) values('${x.name}','${x.contact}','${x.routeno}','${x.dlno}','${x.institute}','${x.aadhar}','${x.status}');`;
            conn.query(query,(err,result,fields)=>{
                if(err){
                    req.flash('failure','Duplicate Entry. Please Try again!');
                    res.redirect('/dashboard-driver-add'); 
                }
                else
                {
                    req.flash('success','Driver updated successfully');
                    res.redirect('/dashboard-driver-add'); 
                }
            });
        }
    });
});

router.get('/dashboard-driver-view',middleware.isLoggedIn(),(req,res)=>{
    let query = `select * from drivers;`;
    conn.query(query,(err,result,fields)=>{
        res.render('dashboard/driver/driver-view',{
            title: 'driver',
            result: result,
            ins: ['Sistec-GN','Sistec-ER','SPS-GN','SPS-SN','SPS-RN','SPS-RB'],
            status: ['Inactive','Active']
        });
    });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const conn = require('../../db');
const middleware = require('../../middlewares/middleware');

router.get('/dashboard-vehicles-add',middleware.isLoggedIn(),(req,res)=>{
    let query = `select id,short_name from institute;`;
    conn.query(query,(err,result,fields)=>{
        res.render('dashboard/vehicle/vehicles-add',{
            title: 'vehicle',
            ins: result,
            success: req.flash('success'),
            failure: req.flash('failure')
        });
    });
});

router.post('/vehicles-add',(req,res)=>{
    let x = req.body.vehicle;
    let query = `insert into vehicles (reg_no,route_no,v_type,capacity,institute_id) values('${x.regno}','${x.routeno}','${x.vtype}','${x.capacity}','${x.institute}');`;
    conn.query(query,(err,result,fields)=>{
        if(err)
        {
            req.flash('failure','Duplicate Entry. Please try again');
            res.redirect('/dashboard-vehicles-add');
        }
        else
        {
            req.flash('success','Vehicle added successfully');
            res.redirect('/dashboard-vehicles-add');
        }
    });
});

router.get('/dashboard-vehicles-edit',middleware.isLoggedIn(),(req,res)=>{
    let query = `select id,short_name from institute;`;
    conn.query(query,(err,result,fields)=>{
        res.render('dashboard/vehicle/vehicles-edit',{
            title: 'vehicle',
            ins: result,
            success: req.flash('success'),
            failure: req.flash('failure'),
        });
    });
});

router.post('/vehicle-edit',(req,res)=>{
    let x = req.body;
    let query = `select * from vehicles where reg_no='${x.regno}';`;
    conn.query(query,(err,result,fields)=>{
        if(JSON.stringify(result) === JSON.stringify([]))
            console.log('Vehicle not found');
        else
        {
            conn.query(`DELETE FROM vehicles WHERE reg_no='${x.regno}';`,(err,result,fields)=>{

            });
            let query = `insert into vehicles (reg_no,route_no,v_type,capacity,institute_id) values('${x.regno}','${x.routeno}','${x.vtype}','${x.capacity}','${x.institute}');`;
            conn.query(query,(err,result,fields)=>{
                if(err)
                {
                    console.log(err);
                    req.flash('failure','Updation falied! Please fill the details correctly.');
                    res.redirect('/dashboard-vehicles-edit');
                }
                else
                {
                    req.flash('success','Vehicle successfully updated!');
                    res.redirect('/dashboard-vehicles-edit');
                }
            });
        }
    });
});

router.get('/dashboard-vehicles-view',middleware.isLoggedIn(),(req,res)=>{
    let query = `select * from vehicles;`;
    conn.query(query,(err,result,fields)=>{
        res.render('dashboard/vehicle/vehicles-view',{
            title: 'vehicle',
            result: result,
            role: ['Operator','Admin'],
            ins: ['Sistec-GN','Sistec-ER','SPS-GN','SPS-SN','SPS-RN','SPS-RB'],
            vtype:['Bus','Van']
        });
    });

});

// This below routes will remain inactive for now

// app.get('/dashboard-vehicles-del',authenticationMiddleware(),(req,res)=>{
//     res.render('dashboard/vehicle/vehicles-del',{
//         title: 'vehicle'
//     });
// });

// app.post('/del-vehicle',authenticationMiddleware(),(req,res)=>{
//     let query = `delete from vehicles where id='${req.body.id};'`;
//     conn.query(query,(err,result,fields)=>{
//         if(err)
//             console.log(err);
//         else
//             console.log('record deleted');
//     });
//     res.redirect('/dashboard-vehicles-del');
// });

module.exports = router;
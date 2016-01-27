var express = require('express');
var adminRouter = express.Router();
var list = { list: ['Superman', 'Batman', 'Spider-man'] };


adminRouter.route('/')
    .get(function (req, res) {
        res.render('admin-add-character', list);
    });
   adminRouter.route('/add') 
.post(function (req, res) {
    var sname = req.body.charname;
        res.send(sname);
    });
adminRouter.route('/:id')
    .get(function(req,res){
        var id = req.params.id;
        res.render('character',{character:list.list[id]});
    });
module.exports = adminRouter;
var express = require('express');
var characterRouter = express.Router();
var list = { list: ['Superman', 'Batman', 'Spider-man'] };


characterRouter.route('/')
    .get(function (req, res) {
        res.render('characters', list);
    });
characterRouter.route('/:id')
.get(function(req,res){
    var id = req.params.id;
    res.render('character',{character:list.list[id]});
});
module.exports = characterRouter;
var express = require('express');
var db = require('../db');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
            if (!req.user) { return res.render('home'); }
            next();
  }, function(req, res, next) {
            console.log(JSON.stringify(req.user));
            res.render('index', { user: `-${req.user.username}-`});
});

router.get('/time', function(req, res, next){
 /**when a user has been authenticated successfully later.. */
  if (!req.user) {
     return res.render('home'); 
    }  
    //prints the session data
      res.json(req.session);
     
})


router.get('/completed',  function(req, res, next) {
  res.render('index', { user: req.user });
});



module.exports = router;

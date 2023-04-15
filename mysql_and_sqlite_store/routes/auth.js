var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var db = require('../db');
//create a router instance
var router = express.Router();
/**
 * Strategies are responsible for authenticating requests, which they
 *  accomplish by implementing an authentication mechanism. 
 * Authentication mechanisms define how to encode a credential,
 *  such as a password or an assertion from an 
 * identity provider (IdP), in a request.
 */
passport.use(new LocalStrategy(verify));
/*

▄▀█ █░█ ▀█▀ █░█ █▀▀ █▄░█ ▀█▀ █ █▀▀ ▄▀█ ▀█▀ █ █▀█ █▄░█
█▀█ █▄█ ░█░ █▀█ ██▄ █░▀█ ░█░ █ █▄▄ █▀█ ░█░ █ █▄█ █░▀█
*/
/**A verify function yields under one of three conditions:
 *  success, failure, or an error */
async function verify(username, password, cb) {

  let usrinfo, hashedPasswFromReq;
  try{ //read user info from the DB
          usrinfo = await new Promise((resolve, reject) => {
              
              db.query('SELECT * FROM users WHERE username = ?', [ username ], function(err, row) {
                  if (err) {
                      reject(err);
                      return; 
                  } else {
                      resolve(row[0]);
                  }
              });

          });
  
    //When a user hasn`t bee found:
    if (!usrinfo) {

      return cb(null, false, { message: 'Incorrect username or password.' });
    }
    console.log(JSON.stringify(usrinfo))
    //create a hash from a given http request`s password:
  
  hashedPasswFromReq = await   new Promise((resolve, reject) => {
                  //making hash
                  crypto.pbkdf2(password, usrinfo.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
                      if (err) { 
                          reject(err);
                          return; 
                      } else{
                          resolve(hashedPassword);
                      }
                                          
                  });
              });
} catch(e) {
  /**If an error occurs, such as the database not being available,
   *  the callback is called with an error */

    return cb(e);
}
    //comparing a hash from the DB and a hash from the request (generated previously):
    if (!crypto.timingSafeEqual(usrinfo.hashed_password, hashedPasswFromReq)) {
      /*2) F A I L: If the credential  is not valid, the verify function calls 
      the callback with false to indicate an authentication failure:*/
        return cb(null, false, { message: 'Incorrect username or password.' });
    }
    //3) S U C C E S S: When credential is valid, it calls the callback with the authenticating user
    return cb(null, usrinfo);

}

/**

█▀█ █▀█ █░█ ▀█▀ █▀▀ █▀
█▀▄ █▄█ █▄█ ░█░ ██▄ ▄█
 */
router.get('/login', function(req, res, next) {
  res.render('login',{time: new Date().toLocaleTimeString()});
});


router.get('/signup', function(req, res, next) {
  res.render('signup');
});


router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

/**In this route, passport.authenticate() is middleware 
 * which will authenticate the request.  By default, when authentication succeeds, 
 * the req.user property is set to the authenticated user, a login session is established,
 *  and the next function in the stack is called. When authentication fails, an HTTP 
 * 401 Unauthorized response will be sent and the request-response cycle will end*/
router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));
/*** */

/*-\

█▀█ █▀▀ █▀▀ █ █▀ ▀█▀ █▀▀ █▀█   ▄▀█   █▄░█ █▀▀ █░█░█   █░█ █▀ █▀▀ █▀█
█▀▄ ██▄ █▄█ █ ▄█ ░█░ ██▄ █▀▄   █▀█   █░▀█ ██▄ ▀▄▀▄▀   █▄█ ▄█ ██▄ █▀▄
-*/
router.post('/signup', async function(req, res, next) {
     let hashedUsrPassw , salt, user;
    //generate salt:
     salt = crypto.randomBytes(16);
    //create a hash of the password
   
try {
        hashedUsrPassw =await new Promise((resolve, reject) => {
                crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
                    if (err) {
                        reject(err);
                    }
                    resolve(hashedPassword);
                })
        });
 
/*insert into the DB: */
 
console.log('salt:',salt);
  user = await new Promise((resolve, reject) => {
     
            db.query('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
                req.body.username,
                hashedUsrPassw,
                salt
                ], function(err) {
                    if (err) { 
                        err.usrExists = true;
                        reject(err); 
                    }
                    var user = {
                        id: this.lastID,
                        username: req.body.username
                    };
                    resolve(user);
                })
    });


//login a new user

    await  new Promise((resolve, reject) => {
            req.login(user, function(err) {
            if (err) { 
                    reject(err); 
                }
            res.redirect('/');
            resolve()
        });
        });
} catch (error) {
  //console.log("\x1b[32m", JSON.stringify(error),"\x1b[0m");
  
    return next(error);
}


})


passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

module.exports = router;
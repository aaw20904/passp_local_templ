
const mysql = require('mysql2'); //database mamnagement system MySQL
 
var crypto = require('crypto');

 

/*beg_modify mysql*

█▀▄▀█ █▄█ █▀ █▀█ █░░
█░▀░█ ░█░ ▄█ ▀▀█ █▄▄
** */
//// 1. Create MySQL Connection

const connectionDB = mysql.createConnection({
  user: 'root',
  password: '65535258',
  host: 'localhost',
  database: 'mainbase',
  //the base 'mainbase' must be created manually!
});

go();

async function go () {
  /***try to connect */
await new Promise((resolve, reject) => {
    connectionDB.connect(function(err) {
        if (err) {
            //handle an error
            console.error('error connecting: ' + err.stack);
            process.exit(0);
        }
        resolve();
    })
});

/***create table - when absent */

await new Promise((resolve, reject) => {
     connectionDB.query("CREATE TABLE IF NOT EXISTS users (\
      `id` INT NOT NULL AUTO_INCREMENT,\
      `username` VARCHAR(16) NULL,\
      `hashed_password` BLOB NULL,\
      `salt` BLOB NULL,\
      PRIMARY KEY (`id`),\
      UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE );",(err, rows)=>{
           if(err) {
             reject(err);
           } else{
            console.log('Table created!...')
              resolve(rows);
           }
       })
});
/***write a user */
  // create an initial user (username: alice, password: letmein)
  var salt = crypto.randomBytes(16);
  new Promise((resolve, reject) => {
           connectionDB.query('INSERT  IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)',
            [
              'alice',
              crypto.pbkdf2Sync('letmein', salt, 310000, 32, 'sha256'),
              salt
            ],(err,rows)=>{
                    if(err) {
                        reject(err);
                    } else{
                      console.log('A user *Alice* added!...')
                        resolve(rows);
                    }
            })
  });
}




/*

█▀▄▀█ █▄█ █▀ █▀█ █░░ ▄▄ █▀▀ █▄░█ █▀▄
█░▀░█ ░█░ ▄█ ▀▀█ █▄▄ ░░ ██▄ █░▀█ █▄▀
*/
module.exports = connectionDB;

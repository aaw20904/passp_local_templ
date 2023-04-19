var sqlite3 = require('sqlite3');
var mkdirp = require('mkdirp');
var crypto = require('crypto');

mkdirp.sync('./var/db');

var db = new sqlite3.Database('./var/db/todos.db');
 /**It`s not a callback! The metod runs after start the app each time
 when the app starting.
  This method  means that only one statement can execute
   at a time. Other statements 
  will wait in a queue until all the previous statements are executed.
   */
db.serialize(function() {
  console.log('serialize db...')
  // create the database schema for the todos app
  db.run("CREATE TABLE IF NOT EXISTS users ( \
    id INTEGER PRIMARY KEY, \
    username TEXT UNIQUE, \
    hashed_password BLOB, \
    salt BLOB, \
    name TEXT, \
    email TEXT UNIQUE, \
    email_verified INTEGER \
  )");
  
  
  // create an initial user (username: alice, password: letmein)
  var salt = crypto.randomBytes(16);
  console.log('Alice..')
  db.run('INSERT OR IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
    'alice',
    crypto.pbkdf2Sync('letmein', salt, 310000, 32, 'sha256'),
    salt
  ]);
}); 

module.exports = db;

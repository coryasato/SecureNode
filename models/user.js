var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({

  local : {
    email: String,
    password: String
  },
  
  google : {
    id : String,
    token: String,
    email: String,
    name: String
  }

});

// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// create model and expose it to our app
module.exports = mongoose.model('User', userSchema);
// Data Model for Books
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");
const SALT_FACTOR = 10;
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  displayname: { type: String, required: true },
  groups: [
    {
      groupId: { type: ObjectId },
      groupname: {type: String},
      voted: { type: Boolean },
      isAdmin: { type: String }
    }
  ]
});

userSchema.methods.name = function() {
  return this.displayname;
};

userSchema.methods.user_name = function() {
  return this.username;
};

// Encrypting the password
var noop = function() {};
userSchema.pre("save", function(done) {
  var user = this;
  if (!user.isModified("password")) {
    return done();
  }
  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) {
      return done(err);
    }
    bcrypt.hash(user.password, salt, noop, function(err, hashedPassword) {
      if (err) {
        return done(err);
      }
      user.password = hashedPassword;
      done();
    });
  });
});

// checking password function
userSchema.methods.checkPassword = function(guess, done) {
  bcrypt.compare(guess, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

// Export model
module.exports = mongoose.model("user", userSchema);

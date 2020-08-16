
// Route handlers
const express = require('express');
const router = express.Router();
const passport = require('passport');
const Joi = require("joi");



//import data models
const User = require("../models/user");

// Make user information available to templates
router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});


// RETREIVE all users
router.get("/", function(req,res){
  if(res.locals.currentUser) {
      var path="/"+res.locals.currentUser.user_name()+"/groups"
      res.redirect(path)
    }
    else
      res.render("home");
});

// Route to signup page
router.get("/signup", function(req, res){
  res.render("signup", {error: ""});
});

router.post("/signup", function(req, res, next){
  var username = req.body.username;
  var displayname = req.body.displayname
  var password = req.body.password;
  
const result = validateSignup(req.body);
  if (result.error){
    var error_message = "password has to be 8 digits minimum and no more than 15 digits"
    req.flash("error",error_message);
    return res.render('signup', {error: error_message});
  }
    // return res.status(400).send(result.error.details[0].message);}
  
  User.findOne({username: username }, function(err, user){   
    if (err) {return next(err);}
    if (user) {
      //alert("wrong");
      req.flash("error", "User already exists");
      return res.render("signup", {error:"User already exists."});
    }
    var newUser = new User({
      username: username,
      password: password,
      displayname: displayname
    });
    newUser.save(next);
  });
  }, passport.authenticate("login", {
    successRedirect: "/login",
    failureRedirect: "/signup",
    failureFlash: true
  }));


// route to login page
router.get("/login", function(req, res){
  res.render("login", {error:""});
});

router.post("/login",  function(req, res, next) {
  passport.authenticate('login', function(err, user, info) {
    if (err) { 
      return next(err); 
    }
    if (!user) { 
      req.flash("error", info.message);
      return res.render('login', {error:info.message}); 
    }
    req.logIn(user, function(err) {
      if(err) return next(err)
      return res.redirect('/' + user.username + "/groups");
    })
  })(req, res, next);
});

// route to logout page
router.get("/logout", function(req, res){
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

/*
// route to profile page

router.get("/edit", checkAuthentication, function(req, res){
  res.render("edit");
});

router.post("/edit", checkAuthentication, function(req, res, next){
  req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  req.user.save(function(err) {
    if (err) {
      next(err);
      return;
    }
    req.flash("info", "Profile Updated!");
    res.redirect("/edit");
  });
});
*/
  


// authentication middleware
function checkAuthentication(req, res, next){
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("info", "You must be logged into see this page");
    res.redirect("/login");
  }
};

function validateSignup(signup) {
  const schema = Joi.object().keys({
    displayname: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string()
      .min(8)
      .max(15)
      .required()
  });
  return Joi.validate(signup, schema);
}

module.exports = router;
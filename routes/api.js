const express = require("express");
const router = express.Router();
const Joi = require("joi");
var moment=require("moment-timezone");

const User = require("../models/user");
const Group = require("../models/group");

router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

// my groups
router.get("/:username/groups", function(req, res) {
  if(!res.locals.currentUser) {
    return res.redirect("/")
  }
  if(res.locals.currentUser.username!=req.params.username) {
      return res.status(400).send("You have no access to this page.")
  }
  res.render("dashboard.ejs", {
    user: req.user
  });
});

// form: create group
router.get("/:username/create", function(req, res) {
  if(!res.locals.currentUser) {
    return res.redirect("/")
  }
  if(res.locals.currentUser.username!=req.params.username) {
      return res.status(400).send("You have no access to this page.")
  }
  res.render("create.ejs", {
    user: req.user
  });
});

// submit form: create group
router.post("/:username/create", function(req, res) {
  var groupname = req.body.groupname;
  var admin = req.user;
  var newGroup = new Group({
    groupname: groupname,
    admin: admin.username,
    members: [{ username: admin.username, displayname: admin.displayname }]
  });
  // insert group to db
  Group.create(newGroup, function(err, insertedGroup) {
    if (err) return res.status(404).send("Invalid group.");
    // add group to user.groups
    var group_in_user = {
      groupId: insertedGroup._id,
      groupname: insertedGroup.groupname,
      voted: false,
      isAdmin: "admin"
    };
    // update user
    User.findOneAndUpdate(
      { username: req.user.username }, //query
      { $push: { groups: group_in_user } }, //update body
      { new: true }, //options
      function(err, updatedUser) {
        if (err || !updatedUser) return res.status(404).send("Invalid group.");
        console.log(updatedUser);
        //redirect
        var path = "/" + req.user.username + "/" + insertedGroup._id + "/admin";
        res.redirect(path);
      }
    );
  });
});

// admin add member
router.post("/:username/:group_id/admin/addmember", function(req, res) {
  const member_username = req.body.username;
  const groupname = req.body.groupname;
  const group_id = req.params.group_id;
  var group_in_user = {
    groupId: group_id,
    groupname: groupname,
    voted: false,
    isAdmin: ""
  };

  // update user
  User.findOne({ username: member_username }, function(err, member) {
    // user not found
    if (err || !member) {
      return res.status(400).send("User does not exist.");
    }
    // if added_user exists in this group
    var existed = false;
    member.groups.forEach(group => {
      if (group.groupId == group_id) {
        existed = true;
        return;
      }
    });
    if (existed) return res.status(404).send("User is already in this group.");
    // update user
    member.groups.push(group_in_user);
    member.save(err => {
      if (err) return res.status(400).send("Fail to update user.");

      //update group
      Group.findByIdAndUpdate(
        group_id,
        {
          $push: {
            members: {
              username: member_username,
              displayname: member.displayname
            }
          }
        },
        { new: true }, //options
        function(err, updatedGroup) {
          if (err) return res.status(400).send("Fail to update group.");
          console.log(updatedGroup);
          //redirect
          var path = "/" + req.user.username + "/" + group_id + "/admin";
          res.redirect(path);
        }
      );
    });
  });
});

// add location
router.post("/:username/:group_id/addlocation", function(req, res) {
  const group_id = req.params.group_id;
  const locationName = req.body.location;
  const link = req.body.link;
  const location = {
    locationName: locationName,
    url: link,
    voteNum: 0
  };
  // if it already exist(check by url)
  // else push to group
  Group.findById(group_id, function(err, group) {
    // group not found
    if (err || !group) {
      return res.status(404).send("Group does not exist.");
    }
    // if added_location exists in this group
    var existed = false;
    group.locations.forEach(location => {
      console.log(location.url);
      if (location.url == link && link!="") {
        existed = true;
        return;
      }
    });
    if (existed) return res.status(404).send("Location already existed.");
    // update user
    group.locations.push(location);
    group.save(err => {
      if (err) return res.status(400).send("Fail to add location.");
      //redirect
      var path = "/" + req.user.username + "/" + group_id + "/admin";
      res.redirect(path);
    });
  });
});

// add time
router.post("/:username/:group_id/addtime", function(req, res) {
  const group_id = req.params.group_id;
  const locationName = req.body.location;
  const time = req.body.timeslot;
  const timeslot = {
    time: time,
    voteNum: 0
  };
  // if it already exist(check by timeslot)
  // else push to group
  Group.findById(group_id, function(err, group) {
    // group not found
    if (err || !group) {
      return res.status(404).send("Group does not exist.");
    }
    // if added_location exists in this group
    var existed = false;
    group.timeslots.forEach(timeslot => {
      if (timeslot.time == time) {
        existed = true;
        return;
      }
    });
    if (existed) return res.status(404).send("Time already existed.");
    // update user
    group.timeslots.push(timeslot);
    group.save(err => {
      if (err) return res.status(400).send("Fail to add time.");
      //redirect
      var path = "/" + req.user.username + "/" + group_id + "/admin";
      res.redirect(path);
    });
  });
});

// group page: user is admin
router.get("/:username/:group_id/admin", function(req, res) {
  if(!res.locals.currentUser) {
    return res.redirect("/")
  }
  if(res.locals.currentUser.username!=req.params.username) {
      return res.status(400).send("You have no access to this page.")
  }
  Group.findById(req.params.group_id, function(err, group) {
    if (err || !group) return res.status(404).send("Group not found.");

    User.findOne({ username: req.params.username }, function(err, user) {
      if (err) return res.status(404).send("User does not exist.");

      // get "voted"
      var voted;
      user.groups.forEach(group => {
        if (group.groupId == req.params.group_id) {
          voted = group.voted;
          return;
        }
      });
      

      var cur_datetime = moment().tz('America/New_York').format().slice(0,16); 

      res.render("group.ejs", {
        user: req.user,
        group: group,
        isAdmin: true,
        isVoted: voted,
        cur_datetime: cur_datetime
      });
    });
  });
});

// group page: user is not admin
router.get("/:username/:group_id", function(req, res) {
  if(!res.locals.currentUser) {
    return res.redirect("/")
  }
  if(res.locals.currentUser.username!=req.params.username) {
      return res.status(400).send("You have no access to this page.")
  }
  Group.findById(req.params.group_id, function(err, group) {
    if (err || !group) return res.status(404).send("Group not found.");

    User.findOne({ username: req.params.username }, function(err, user) {
      if (err) return res.status(404).send("User does not exist.");

      // get "voted"
      var voted;
      user.groups.forEach(group => {
        if (group.groupId == req.params.group_id) {
          voted = group.voted;
          return;
        }
      });
      

      var cur_datetime = moment().tz('America/New_York').format().slice(0,16); 

      res.render("group.ejs", {
        user: req.user,
        group: group,
        isAdmin: false,
        isVoted: voted,
        cur_datetime: cur_datetime
      });
    });
  });
});


// save vote results to db
router.post("/:username/:group_id", function(req, res) {
  const isAdmin=req.body.isAdmin;
  console.log(isAdmin)
  let tsid = req.body.timeslots;
  let locid = req.body.location;
  if (!Array.isArray(tsid)) {
    tsid = new Array(tsid);
  }
  if (!Array.isArray(locid)) {
    locid = new Array(locid);
  }
  var grouperror;
  // error handling
  if (req.body.location == undefined && req.body.timeslots == undefined) {
    grouperror = "Please select at least one location and time slot";
  } else if (
    req.body.location == undefined &&
    req.body.timeslots != undefined
  ) {
    grouperror = "Please select at least one location";
  } else if (
    req.body.location != undefined &&
    req.body.timeslots == undefined
  ) {
    grouperror = "Please select at least one time slot";
  }
  if (grouperror) {
    return res.status(400).send(grouperror);
  }

  // only has one time slot
  let votenum;
  Group.findOne(
    { _id: req.params.group_id },
    { timeslots: 1, _id: 0, locations: 1 }
  )
    .exec()
    .then(data => {
      let timearr = data.timeslots;
      let locarr = data.locations;
      //console.log(req.body.timeslots.length)
      let i;
      let j;
      for (i = 0; i < timearr.length; i++) {
        for (j = 0; j < tsid.length; j++) {
          let time_id = timearr[i]._id;
          if (time_id == tsid[j]) {
            votenum = timearr[i].voteNum + 1;
            timearr[i].voteNum = votenum;
            break;
          }
        }
      }

      for (i = 0; i < locid.length; i++) {
        for (j = 0; j < locarr.length; j++) {
          let loc_id = locarr[j]._id;
          if (loc_id == locid[i]) {
            votenum = locarr[j].voteNum + 1;
            locarr[j].voteNum = votenum;
            break;
          }
        }
      }

      Group.update(
        { _id: req.params.group_id }, //query
        { $set: { locations: locarr, timeslots: timearr } }, //update body
        function(err, updatedGroup) {
          if (err) return res.status(400).send("Fail to update vote.");
        });
    });

  User.findOne({ username: req.params.username }, function(err, member) {
    // user not found
    if (err || !member) {
      return res.status(400).send("User does not exist.");
    }
    // if added_user exists in this group
    member.groups.forEach(group => {
      if (group.groupId == req.params.group_id) {
        group.voted = true;
        member.save(err=>{
          if (err) return res.status(400).send("Fail to update user.")
          var path;
          if(isAdmin=="true") {
            path = "/" + req.user.username + "/" + req.params.group_id + "/admin";
          }
          else {
            path = "/" + req.user.username + "/" + req.params.group_id;
          }
          console.log(path);
          res.redirect(path);
        });
      }
    });
  });
  
});


module.exports = router;

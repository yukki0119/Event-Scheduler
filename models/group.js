// Data Model for Books
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    groupname: {type: String, required: true},
    admin: {type: String, required: true},
    locations: [
      {
        locationName: {type: String}, 
        url: {type: String},
        voteNum: {type: Number}
      }
    ],
    timeslots: [
      {
        time: {type: Date}, 
        voteNum: {type: Number}
      }
    ],
    members: [
      {
        username: {type: String},
        displayname: {type: String},
      }
    ]
  }
);

// Export model
module.exports = mongoose.model("group", groupSchema);
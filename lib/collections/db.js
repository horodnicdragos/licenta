Profiles = new Mongo.Collection('profiles');

// Meteor.users.allow({
//   update: function(userId, post) {
//     return {
//       'userId': userId,
//       'post': post
//     };
//   }
// });




// if (Meteor.isServer) {
//   Meteor.startup(function () {
//     if (!Profiles.find({}).count()) {
//       console.log("creating some profiles");

//     }
//   });
  // Meteor.publish("profiles", function () {
  //   return Profiles.find({});
  // });
// }
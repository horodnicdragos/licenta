var connectHandler = WebApp.connectHandlers; // get meteor-core's connect-implementation

// attach connect-style middleware for response header injection
Meteor.startup(function () {
  connectHandler.use(function (req, res, next) {
    res.setHeader('Strict-Transport-Security', 'max-age=2592000; includeSubDomains'); // 2592000s / 30 days
    return next();
  })
})

Accounts.onCreateUser(function(options, user) {

  user.books = [];
  user.readBooks = [];
  user.points = 0;
  user.level = 1;
  user.borrowedBooks = [];

  return user;
});

Meteor.methods({
  updateRecentPlaceRating: function (email, rating, id) {
    check(email, String);
    check(rating, Number);
    check(id, Number);
    Profiles.update ({'email': email, 'places.place_id':id}, {$set: {'places.$.rating': rating }});
  },
  // getFriends: function (email) {
  //   check(email, String);
  //   return Profiles.find({'email': email}, {'friends':1});
  // },
  getPlaces: function(lon, lat, radius, type){
    check(lon, Number);
    check(lat, Number);
    check(radius, Number);
    check(type, String);
      return Meteor.http.call('GET', 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lon+','+lat+'&radius='+radius+'&types='+type+'&key=AIzaSyArmFhKvB-NI8jun40lFYaHlGciqVm1RW4');
  }
});
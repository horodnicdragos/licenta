var connectHandler = WebApp.connectHandlers; // get meteor-core's connect-implementation

// attach connect-style middleware for response header injection
Meteor.startup(function () {
  connectHandler.use(function (req, res, next) {
    res.setHeader('Strict-Transport-Security', 'max-age=2592000; includeSubDomains'); // 2592000s / 30 days
    return next();
  })
})

Accounts.onCreateUser(function(options, user) {
  Profiles.insert({
                    email: user.emails[0].address,
                    places:[],
                    friends: []
    });
  return user;
});

Meteor.methods({
  updateRecentPlaceRating: function (email, rating, id) {
    check(email, String);
    check(rating, Number);
    check(id, Number);
    Profiles.update ({'email': email, 'places.place_id':id}, {$set: {'places.$.rating': rating }});
  },
  updateFriends: function (email, friend_email) {
    check(email, String);
    check(friend_email, String);
    Profiles.update ({'email': email}, {$addToSet: {'friends': friend_email }});
  },
  getPlaces: function(lon, lat, radius, type){
    check(lon, Number);
    check(lat, Number);
    check(radius, Number);
    check(type, String);
    var dictionary = new Array();
    dictionary['Food'] = 'food|restaurant';
    dictionary['Cafe & Bar'] = 'cafe|bar';
    dictionary['Park'] = 'night_club';
    dictionary['Library'] = 'library';
    dictionary['Club'] = 'amusement_park|park';
    dictionary['Clothing'] = 'cothing_store|shoe_store|jewelry_store';
    dictionary['Mall'] = 'shopping_mall';
    dictionary['Cinema'] = 'movie_theater';
    dictionary['Random'] = 'random';
    if(dictionary[type]!=='random'){
      return Meteor.http.call('GET', 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lon+'&radius='+radius+'&types='+dictionary[type]+'&key=AIzaSyArmFhKvB-NI8jun40lFYaHlGciqVm1RW4');
    }
    else{
      return Meteor.http.call('GET', 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lon+'&radius='+radius+'&key=AIzaSyArmFhKvB-NI8jun40lFYaHlGciqVm1RW4');    
    }
  }
});
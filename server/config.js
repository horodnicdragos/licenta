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
    // Check argument types
    check(email, String);
    check(rating, Number);
    check(id, Number);
    Profiles.update ({'email': email, 'places.place_id':id}, {$set: {'places.$.rating': rating }});
  }
});
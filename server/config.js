var connectHandler = WebApp.connectHandlers;

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
                    friends: [],
                    radius: 100
    });
  return user;
});

function intersect(a, b) {
  var aux
  var ret = [];
  var baux = [];
  if (b.length > a.length)
   aux = b, b = a, a = aux;
  b.forEach(function(el) {
    baux.push(el.place_id);
  });
  // Return a list of common ids
  a.forEach(function (el) {
      if (baux.indexOf(el.place_id) !== -1) 
        ret.push(el.place_id);
  });
  return ret;
}


Meteor.methods({
  updateRecentPlaceRating: function (email, rating, id) {
    check(email, String);
    check(rating, Number);
    check(id, String);
    Profiles.update ({'email': email, 'places.place_id':id}, {$set: {'places.$.rating': rating, 'places.$.recent': false }});
  },
  updateFriends: function (email, friend_email) {
    check(email, String);
    check(friend_email, String);
    Profiles.update ({'email': email}, {$addToSet: {'friends': friend_email }});
  },
  removeFriend: function (email, friend_email) {
    check(email, String);
    check(friend_email, String);
    Profiles.update ({'email': email}, {$pull: {'friends': friend_email }});
  },
  updatePlaces: function (email, name, types_array, id, rating, recent) {
    check(email, String);
    check(name, String);
    check(types_array, Array);
    check(id, String);
    check(rating, Number);
    check(recent, Boolean);
    var places = Profiles.find({'email': email}).fetch()[0].places;
    var exists = false;
    // console.log(places);
    places.forEach(function(el){
      // console.log(el.place_id);
      if (el.place_id===id)
        exists = true;
    });
    if (!exists) {
      Profiles.update ({'email': email}, {$addToSet: {'places': {
                            name: name,
                            types: types_array,
                            place_id: id,
                            rating: rating,
                            recent: recent }
                                        }
                        });
    }
  },
  removePlace: function (email, name, types_array, id, rating, recent) {
    check(email, String);
    check(name, String);
    check(types_array, Array);
    check(id, String);
    check(rating, Number);
    check(recent, Boolean);
    Profiles.update ({'email': email}, {$pull: {'places': {
                          name: name,
                          types: types_array,
                          place_id: id,
                          rating: rating,
                          recent: recent }
                                      }
                      });
  },
  recommendPlaces: function(lon, lat, type, userEmail, radius){
    check(lon, Number);
    check(lat, Number);
    check(type, String);
    check(userEmail, String);
    check(radius, Number);

    function getPlaces(lon, lat, radius, type){
    var dictionary = new Array();
    dictionary['Food'] = 'food|restaurant';
    dictionary['Cafe & Bar'] = 'cafe|bar';
    dictionary['Park'] = 'amusement_park|park';
    dictionary['Library'] = 'library';
    dictionary['Club'] = 'night_club';
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
    // Current user's places
    var userPlaces = Profiles.find({email: userEmail}).fetch()[0].places;

    // Other user's places
    var otherPlaces = [];
    var otherPlacesAux = Profiles.find().fetch();
    otherPlacesAux.forEach(function (el) {
      var temp = [];
      el.places.forEach(function (item) {
        var obj = {};
        obj['place_id'] = item.place_id;
        obj['rating'] = item.rating;
        temp.push(obj);
      });
      otherPlaces.push(temp);
    });

    // Local places
    var newPlaces = [];

    var newPlacesAux = JSON.parse(getPlaces(lon, lat, radius, type).content);
    newPlacesAux.results.forEach(function(place){
      tempObj = {};
      tempObj['name'] = place.name;
      tempObj['types'] = place.types;
      tempObj['place_id'] = place.place_id;
      tempObj['lat'] = place.geometry.location.lat;
      tempObj['lon'] = place.geometry.location.lng;
      newPlaces.push(tempObj);
    });

    var suggestions = []
    // Cosine distance between users with common places that rated a new place
    newPlaces.forEach(function (newPlace){
      if(intersect([newPlace], userPlaces).length ==0){
      ratings = []
      otherPlaces.forEach(function (el) {
        var userTotalRatings = 0;
        var commonRatings = 0;
        var otherTotalRatings = 0;
        var suggestedRating = 0;
        var similarity = 0;
        // console.log(intersect(userPlaces,el));
        // console.log(intersect([newPlace], userPlaces));
        if (intersect(userPlaces,el).length != 0 && intersect([newPlace], el).length !=0)
        {
          el.forEach(function(place){
            if(newPlace.place_id === place.place_id)
              suggestedRating = place.rating;
            otherTotalRatings += place.rating*place.rating;
          });
          userPlaces.forEach(function(place){
            userTotalRatings += place.rating*place.rating;
          });
          userPlaces.forEach(function(place1){
            el.forEach(function(place2){
              if (place1.place_id === place2.place_id)
                commonRatings += place1.rating*place2.rating;
            });
          });
          similarity = (commonRatings) / (Math.sqrt(userTotalRatings) * Math.sqrt(otherTotalRatings));
          var obj = {};
          obj['similarity'] = similarity;
          obj['rating'] = suggestedRating;
          ratings.push(obj);
        }
      });
    
    var tempObj = {};
    var score = 0;

    tempObj['name'] = newPlace.name;
    tempObj['types'] = newPlace.types;
    tempObj['place_id'] = newPlace.place_id;
    tempObj['lat'] = newPlace.lat;
    tempObj['lon'] = newPlace.lon;
    tempObj['recent'] = true;

    ratings.forEach(function(place){
      if (place.similarity > 0)
        score += place.rating * place.similarity;
    });
    tempObj['score'] = score;
    suggestions.push(tempObj);
    }
    });
    return suggestions;
  },
  groupProcessing: function(group, places){
    check(group, Array);
    check(places, Array);
    var allPlaces = [];
    allPlaces.push(places);
    var newPlaces = places;
    group.forEach(function(el){
      console.log(el.email);
      var userPlaces = Profiles.find({email: el.email}).fetch()[0].places;
      // Other users' places
      var otherPlaces = [];
      var otherPlacesAux = Profiles.find().fetch();
      otherPlacesAux.forEach(function (el) {
        var temp = [];
        el.places.forEach(function (item) {
          var obj = {};
          obj['place_id'] = item.place_id;
          obj['rating'] = item.rating;
          temp.push(obj);
        });
        otherPlaces.push(temp);
      });
        var suggestions = []
        // Cosine distance between users with common places that rated a new place
        newPlaces.forEach(function (newPlace){
          // if(intersect([newPlace], userPlaces).length == 0) {
          ratings = []
          otherPlaces.forEach(function (el) {
            var userTotalRatings = 0;
            var commonRatings = 0;
            var otherTotalRatings = 0;
            var suggestedRating = 0;
            var similarity = 0;
            // console.log(intersect(userPlaces,el));
            // console.log(intersect([newPlace], userPlaces));
            if (intersect(userPlaces,el).length != 0 && intersect([newPlace], el).length !=0)
            {
              el.forEach(function(place){
                if(newPlace.place_id === place.place_id)
                  suggestedRating = place.rating;
                otherTotalRatings += place.rating*place.rating;
              });
              userPlaces.forEach(function(place){
                userTotalRatings += place.rating*place.rating;
              });
              userPlaces.forEach(function(place1){
                el.forEach(function(place2){
                  if (place1.place_id === place2.place_id)
                    commonRatings += place1.rating*place2.rating;
                });
              });
              similarity = (commonRatings) / (Math.sqrt(userTotalRatings) * Math.sqrt(otherTotalRatings));
              console.log(similarity);
              var obj = {};
              obj['similarity'] = similarity;
              obj['rating'] = suggestedRating;
              ratings.push(obj);
            }
          });
        
        var tempObj = {};
        var score = 0;

        tempObj['name'] = newPlace.name;
        tempObj['types'] = newPlace.types;
        tempObj['place_id'] = newPlace.place_id;
        tempObj['lat'] = newPlace.lat;
        tempObj['lon'] = newPlace.lon;
        tempObj['recent'] = true;

        ratings.forEach(function(place){
          if (place.similarity > 0)
            score += place.rating * place.similarity;
          });
        tempObj['score'] = score;
        suggestions.push(tempObj);
        // }
      });
      allPlaces.push(suggestions);
    });
  console.log(allPlaces);
  return allPlaces;
  },
  getPlaceById: function(place_id){
    check(place_id, String);
    return JSON.parse(Meteor.http.call('GET', 'https://maps.googleapis.com/maps/api/place/details/json?placeid='+place_id+'&key=AIzaSyArmFhKvB-NI8jun40lFYaHlGciqVm1RW4').content);
  },
  updateRadius: function(value, email){
    check(value, Number);
    check(email, String);
     Profiles.update ({'email': email}, {$set: {'radius': value}}); 
  }
});
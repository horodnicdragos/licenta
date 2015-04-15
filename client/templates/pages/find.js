Friends = new Mongo.Collection();


Template.find.helpers({
  settings: function() {
    return {
      position: Session.get("position"),
      limit: 10,
      rules: [
        {
          // token: '',
          collection: Friends,
          field: 'email',
          matchAll: true,
          template: Template.standardLegends
        }
      ]
    };
  },
  legends: function() {
    // console.log(Meteor.call('getFriends', Session.get('email')));
    return Friends.find({});
  }
});

// Google Maps Api
if (Meteor.isClient) {
  Meteor.startup(function() {
    if(Meteor.user()){
      Session.set('email', Meteor.user().emails[0].address);
    }
    if(Meteor.user()){
      var email = Meteor.user().emails[0].address;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
    Session.set('lat', position.coords.latitude);
    Session.set('lon', position.coords.longitude);
    GoogleMaps.load();
    });
  });
}
Template.find.helpers({
  MapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      // Map initialization options
      return {
        center: new google.maps.LatLng(Session.get('lat'), Session.get('lon')),
        zoom: 8
      };
    }
  }
});

Template.find.onCreated(function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('Map', function(map) {
    // Add a marker to the map once it's ready
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(Session.get('lat'), Session.get('lon')),
      map: map.instance
    });
  });
});


// Logic
Template.find.events({
  'click #searchBookBtn': function () {
    var a = Books.findOne({
      name: $('input#searchBook').val()
    });
    console.log(a);
    $('.bookResult').html();
  },

  'click .borrow': function () {
    Books.update ({'_id':this._id}, {$set: {'currentUser': Meteor.user()._id }});
    Meteor.users.update ({'_id': Meteor.user()._id}, {$addToSet: {'borrowedBooks': this._id}});
    $('.borrow').parent().html("<i class='fa fa-check fa-3x' style='color: #009E78;'></i>");
  },
  'click .stars-rating': function () {
    if(Meteor.user()){
      var email = Meteor.user().emails[0].address;
      console.log(email);
    }
    var rating = $('#'+this.id).data('userrating');
    console.log(this.id);
    console.log(rating);
    Meteor.call('updateRecentPlaceRating', email, rating, this.id);

  }
});

Template.find.helpers({
  books: function() {
    var a = [];
    var x = Books.find({});
    x.forEach( function(elem) {
      a.push(elem);
    });
    console.log(a);
    return a;
  },
  profile: function() {
    if(Meteor.user()){
      var email = Meteor.user().emails[0].address;
      console.log(email);
      var friends = Profiles.find({'email': email}, {fields:{'friends':1}});
      console.log(friends);
      console.log('pula');
      friends.forEach(function (el){
        Friends.insert(el);
      });

    }

    // Meteor.call('getPlaces',lon, lat, radius, type, function(err,results){
    //     console.log(results.content);
    //     Session.set('places',JSON.parse(results.content));
    // });
    // console.log(Session.get('places'))

    var profile = Profiles.findOne({email:email});
    return profile;
  },
  gravatarHash: function() {
    return CryptoJS.MD5(Session.get('email')).toString();
  }
});

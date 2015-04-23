// Google Maps Api
if (Meteor.isClient) {
  Meteor.startup(function() {
    navigator.geolocation.getCurrentPosition(function(position) {
    Session.set('lat', position.coords.latitude);
    Session.set('lon', position.coords.longitude);
    GoogleMaps.load();
    });
  });
}

Deps.autorun(function() {
  if (Meteor.loggingIn()){
    // Meteor._reload.reload();
  }
  if (!Meteor.user()) {
    Friends.remove({});
    Group.remove({});
    People.remove({});
    return;
  }
});


Template.home.helpers({
  MapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      // Map initialization options
      return {
        center: new google.maps.LatLng(Session.get('lat'), Session.get('lon')),
        zoom: 16
      };
    }
  }
});

Template.home.onCreated(function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('Map', function(map) {
    // Add a marker to the map once it's ready
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(Session.get('lat'), Session.get('lon')),
      map: map.instance
    });
  });
});

Template.header.events({
  'click #login-buttons-logout': function(){
    Meteor._reload.reload();
  }
});
// Logic
Template.home.events({
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
    }
    var rating = $('#'+this.id).data('userrating');
    Meteor.call('updateRecentPlaceRating', email, rating, this.id);
    swal({   title: "Thank you!",   text: "Your rating will help us suggest the best places.",   timer: 1000, type: "success",   showConfirmButton: false });

  }
});

Template.home.helpers({
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
      Session.set('email', Meteor.user().emails[0].address);
    }

    // Meteor.call('getPlaces',function(err,results){
    //     console.log(results.content);
    //     Session.set('places',JSON.parse(results.content));
    // });
    // console.log(Session.get('places'))

    var profile = Profiles.findOne({email:Session.get('email')});
    return profile;
  }
});

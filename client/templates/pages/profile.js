var place;
var lat = 44.435527;
var lon = 26.102486;

Template.profile.helpers({
  gravatarHash: function() {
    return CryptoJS.MD5(Meteor.user().emails[0].address).toString();
  },
  friends: function(){
    if(Meteor.user())
      return Profiles.find({email:Meteor.user().emails[0].address}, {friends:1}).fetch()[0].friends.length;
  },
  places: function(){
    return Profiles.find({email:Meteor.user().emails[0].address}, {places:1}).fetch()[0].places.length;
  }
});

if (Meteor.isClient) {
  Meteor.startup(function() {
    GoogleMaps.load({
      key: 'AIzaSyBs0-kUSnnfeqJCQgePm6FJ_gBJ8l9lMuc',
      libraries: 'places'
    });
  });
}

Template.profile.rendered = function() {
  Tracker.autorun(function () {
    if (GoogleMaps.loaded()) {
      $("#place").geocomplete({
        map: GoogleMaps.maps.placesMap.instance,
        bounds: GoogleMaps.maps.placesMap.instance.getBounds(),
        types: ['establishment']
        }
        );
    $("#place")
      .geocomplete()
      .bind("geocode:result", function(event, result){
        console.log(result);
        place = result;
      });
    }
  });
}

Template.profile.helpers({
  mapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      // Map initialization options
      return {
        center: new google.maps.LatLng(lat,lon),
        // center: new google.maps.LatLng(Session.get('lat'),Session.get('lon')),
        zoom: 11
      };

    }
  },
  profile: function() {
    if(Meteor.user())
      return Profiles.findOne({email:Meteor.user().emails[0].address});
  }
});

Template.profile.onCreated(function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('placesMap', function(map) {
    console.log(GoogleMaps.maps.placesMap.instance.getBounds());
    // Add a marker to the map once it's ready
    var marker = new google.maps.Marker({
      position: map.options.center,
      map: map.instance
    });
  });
});

Template.profile.events({
  'click #add-place': function () {
    console.log('merge');
    if(Meteor.user()){
      var email = Meteor.user().emails[0].address;
    }
    var rating = $('#newRating').data('userrating');
    var places = Profiles.find({'email': email}).fetch()[0].places;
    var exists = false;
    console.log(places);
    places.forEach(function(el){
      if (el.place_id===place.place_id)
        exists = true;
    });
    if(rating!=undefined)
    {
      Meteor.call('updatePlaces', email, place.name, place.types, place.place_id, rating, false);
      if(!exists)
      {
          sweetAlert({   title: place.name,
               text: place.adr_address+"<br><br>Thank you for rating! If you change your mind you can always attribuite a new rating to your current places.",
               html: true,
               type: 'success' });
      }        
      else
      {
          sweetAlert({   title: place.name,
               text: place.adr_address+"<br><br>This place is already on your list!",
               html: true,
               type: 'error' });
      } 
    }
    else
    {
      Meteor.call('updatePlaces',email, place.name, place.types, place.place_id, 0, true)
      if(!exists)
      {
          sweetAlert({   title: place.name,
               text: place.adr_address+"<br><br>Don't forget to rate this place!",
               html: true,
               type: 'info' });
      }        
      else
      {
          sweetAlert({   title: place.name,
               text: place.adr_address+"<br><br>This place is already on your list!",
               html: true,
               type: 'error' });
      } 
    }

    console.log(place);

  },
  'click .stars-rating': function () {
    if(Meteor.user()){
      var email = Meteor.user().emails[0].address;
    }
    var rating = $('#'+this.id).data('userrating');
    Meteor.call('updateRecentPlaceRating', email, rating, this.id);

  },
  'click .dismiss': function () {
    if(Meteor.user()){
      var email = Meteor.user().emails[0].address;
    }
    Meteor.call('removePlace', email, this.name, this.types, this.place_id, this.rating, false);
  }
});
// Google Maps Api
if (Meteor.isClient) {
  Meteor.startup(function() {
    GoogleMaps.load();
  });
}
Template.home.helpers({
  MapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      // Map initialization options
      return {
        center: new google.maps.LatLng(44.4298, 26.1326),
        zoom: 8
      };
    }
  }
});

Template.home.onCreated(function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('Map', function(map) {
    // Add a marker to the map once it's ready
    var marker = new google.maps.Marker({
      position: map.options.center,
      map: map.instance
    });
  });
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
      console.log(email);
    }
    var rating = $('#'+this.id).data('userrating');
    console.log(this.id);
    console.log(rating);
    // profile = Profiles.find({email:email});
    // var docid = Profiles.findOne({'email': email, 'places.place_id':this.id});
    // Profiles.update ({_id:docid._id}, {$set: {'places.$.rating': rating }});
    Meteor.call('updateRecentPlaceRating', email, rating, this.id);
    // Profiles.update ({'email': email, 'places.place_id':this.id}, {$set: {'places.$.rating': rating }});
    // var places = Profiles.find({"places": {"$elemMatch": {"place_id": this.id}}});

    // profile.update({'places.place_id':this._id}, {$set: {'places.$.rating': rating }});
    // Profiles.update ({'email': email, 'places.place_id':this._id}, {$set: {'rating': rating }});
    // console.log(docid);
    // console.log(profile);
    // profile.forEach(function(el){
    //   if(el.place_id === this.id)
    //     console.log('e ok');
    //     console.log(el);
    // });

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
      var email = Meteor.user().emails[0].address;
      console.log(email);
    }
    var profile = Profiles.findOne({email:email});
    return profile;
  }
});

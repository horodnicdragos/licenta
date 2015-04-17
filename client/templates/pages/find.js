Friends = new Mongo.Collection();
Group = new Mongo.Collection();
function getFriends(){
    var data = Friends.find();
    if(Meteor.user()&&!data.count()){
      var email = Meteor.user().emails[0].address;
      var friends = Profiles.find({'email': email}, {fields:{'friends':1}}).fetch()[0].friends;
      for(i in friends){
        Friends.insert({ email: friends[i] , gravatar: CryptoJS.MD5(friends[i]).toString()});
        Meteor.clearInterval(getFriends);
      }
    }
};
getFriends = Meteor.setInterval(getFriends, 1000);

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
  'click #add-friend-to-group': function () {
    var email = $('#legend').val();
    if (Friends.find({'email':email}).count()){
    console.log(email);
    var gravatar = CryptoJS.MD5(email).toString();
    console.log(gravatar);
    $('.group-container').append("<span class='click-avatar' id='"+gravatar+"'><span data-content='✕' class='image'><img src='http://www.gravatar.com/avatar/"+gravatar+"?s=40' class='img-circle mini-avatar'/></span></span>");
    var obj = Friends.find({'email':email}).fetch();
    console.log(obj[0].email);
    Group.insert(obj[0]);
    Friends.remove(obj[0]);
    }
    $('#legend').val('');
  },

  'click #find-places': function () {
    var places;
    var semaphore = 0;
    Meteor.call('getPlaces', Session.get('lon'), Session.get('lat'), 1000, 'restaurant', function(err,results){
        // console.log(results.content);
        Session.set('places',JSON.parse(results.content));
        places =  Session.get('places');
        semaphore = 1;
    });
    getPlaces = Meteor.setInterval(function(){
      if(semaphore === 1){
      semaphore = 0;
      console.log(places);
      console.log(typeof(places));
      Meteor.clearInterval(getPlaces);
      //Iterating though the given places
        places.results.forEach(function(el){
          console.log(el.name);
        });
      }
    }, 1000);
    // Books.update ({'_id':this._id}, {$set: {'currentUser': Meteor.user()._id }});
    // Meteor.users.update ({'_id': Meteor.user()._id}, {$addToSet: {'borrowedBooks': this._id}});
    // $('.borrow').parent().html("<i class='fa fa-check fa-3x' style='color: #009E78;'></i>");
  },
  'click .click-avatar': function (event) {
    console.log(event.currentTarget.id);
    var gravatar = event.currentTarget.id;
    var obj = Group.find({'gravatar':gravatar}).fetch();
    console.log(obj);
    Friends.insert(obj[0]);
    Group.remove(obj[0]);
    $('#'+event.currentTarget.id).remove();

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



    var profile = Profiles.findOne({email:email});
    return profile;
  },
  gravatarHash: function() {
    return CryptoJS.MD5(Session.get('email')).toString();
  }
});

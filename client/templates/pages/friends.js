People = new Mongo.Collection();
var marker;
function getFriends(){
    // var data = People.find();
    // if(Meteor.user()&&!data.count()){
    if(Meteor.user()){
      var email = Meteor.user().emails[0].address;
      Profiles.find({}).fetch().forEach(function(el){
        People.insert({'email':el.email, gravatar:CryptoJS.MD5(el.email).toString()});
      });
        Meteor.clearInterval(getFriends);
      // var friends = Profiles.find({'email': email}, {fields:{'friends':1}}).fetch()[0].friends;
      // for(i in friends){
        // Friends.insert({ email: friends[i] , gravatar: CryptoJS.MD5(friends[i]).toString()});
      // }
    }
};
getFriends = Meteor.setInterval(getFriends, 1000);

Template.friends.helpers({
  settings: function() {
    return {
      position: Session.get("position"),
      limit: 10,
      rules: [
        {
          // token: '',
          collection: People,
          field: 'email',
          matchAll: true,
          template: Template.standardLegendsFriends
        }
      ]
    };
  },
  legends: function() {

    // console.log(Meteor.call('getFriends', Session.get('email')));
    return People.find({});
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
Template.friends.helpers({
  MapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      // Map initialization options
      if(Session.get('newLat')&&Session.get('newLon'))
        {
          return {
            center: new google.maps.LatLng(Session.get('newLat'), Session.get('newLon')),
            zoom: 16
          };
        }
      else
        {
          return {
            center: new google.maps.LatLng(Session.get('lat'), Session.get('lon')),
            zoom: 16
          };
        }
    }
  }
});

Template.friends.onCreated(function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('Map', function(map) {
    // Add a marker to the map once it's ready    
    var gravatar = CryptoJS.MD5(Meteor.user().emails[0].address).toString();
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(Session.get('lat'), Session.get('lon')),
      map: map.instance,
      icon: 'http://www.gravatar.com/avatar/'+gravatar+'?s=40'
    });
  });
});


// Logic
Template.friends.events({
  'click #add-friend-to-group': function () {
    var email = $('#legend').val();
    if (Profiles.find({email:email}).count()){
    var gravatar = CryptoJS.MD5(email).toString();
    console.log(Profiles.findOne({'email':Meteor.user().emails[0].address}).friends.indexOf(email));
    if (Profiles.findOne({'email':Meteor.user().emails[0].address}).friends.indexOf(email)>-1) {
      sweetAlert("Sorry!", email+" is already your friend. You must pick someone else!", "error");
    }
    else
    {
    sweetAlert({   title: "<img src='http://www.gravatar.com/avatar/"+gravatar+"?s=80' class='img-circle'/><br>New Friend!",
             text: "You and <em>"+email+"<em> are now friends!",
             html: true });
    // TODO DE INLOCUIT TOATE SESSION GET CU QUERY
    Meteor.call('updateFriends', Meteor.user().emails[0].address, email);
    Friends.insert({ email: email , gravatar:gravatar});
    }
    // $('.group-container').append("<span class='click-avatar' id='"+gravatar+"'><span data-content='✕' class='image'><img src='http://www.gravatar.com/avatar/"+gravatar+"?s=40' class='img-circle mini-avatar'/></span></span>");
    // var obj = Friends.find({'email':email}).fetch();
    // console.log(obj[0].email);
    // Friends.remove(obj[0]);
    }
    // TODO DE REZOLVAT ACEST IF:

    $('#legend').val('');
  },
  'click #find-places': function () {
    var places;
    var semaphore = 0;
    if(Session.get('place-type')){
      Meteor.call('getPlaces', Session.get('lon'), Session.get('lat'), 1000, Session.get('place-type'), function(err,results){
          // console.log(results.content);
          Session.set('places',JSON.parse(results.content));
          places =  Session.get('places');
          semaphore = 1;
      });
    }
    else{
      sweetAlert("Oops...", "You must pick a place type first!", "error");
    }
    getPlaces = Meteor.setInterval(function(){
      if(semaphore === 1){
        semaphore = 0;
        console.log(places);
        console.log(typeof(places));
        Meteor.clearInterval(getPlaces);
        //Iterating though the given places

        places.results.forEach(function(el){
          // console.log(el);
          // // sweetAlert(el.name);
          console.log(el.geometry.location.lat+' '+el.geometry.location.lng);
          var myLatLng = new google.maps.LatLng(el.geometry.location.lat, el.geometry.location.lng);
          marker = new google.maps.Marker({
            position: myLatLng,
            map: GoogleMaps.maps.Map.instance
          });
          GoogleMaps.maps.Map.instance.setCenter(marker.getPosition());
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
  },
  'click .click-place-type': function (event) {
    var selected = event.currentTarget.getAttribute("data");
    Session.set('place-type',selected);
  }
});

Template.friends.helpers({
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
  },
  placeType: function() {
    if (Session.get('place-type'))
      return Session.get('place-type');
    else
      return 'Pick'
  }
});

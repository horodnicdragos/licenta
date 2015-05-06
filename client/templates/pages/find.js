Friends = new Mongo.Collection();
Group = new Mongo.Collection();
var marker;
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

// getFriends = Meteor.setInterval(getFriends, 1000);

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

Template.find.onCreated(function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
  getFriends = Meteor.setInterval(getFriends, 1000);
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

setInterval(function(){
  if (Session.get('recAddress'))
  $('#address-space').html(Session.get('recAddress'));
  else
  $('#address-space').html('');
  $('#hover-friend').fadeIn(500);
  $('#hover-friend').fadeOut(500);
}, 1000);

// Logic
Template.find.events({
  'click #add-friend-to-group': function () {
    var email = $('#legend').val();
    if (Friends.find({'email':email}).count()){
    var gravatar = CryptoJS.MD5(email).toString();
    // $('.group-container').append("<span class='click-avatar' id='"+gravatar+"'><span data-content='✕' class='image'><img src='http://www.gravatar.com/avatar/"+gravatar+"?s=40' class='img-circle mini-avatar'/></span></span>");
    $('#hover-friend').html('Click on the pictures to remove friends...');
    $('#'+gravatar).hover(
      function(){
        $('#hover-friend').html('Remove '+email);
      },
      function(){
        $('#hover-friend').html('Click on the pictures to remove friends...');
      });
    var obj = Friends.find({'email':email}).fetch();
    console.log(obj[0].email);
    Group.insert(obj[0]);
    Friends.remove(obj[0]);
    }
    $('#legend').val('');
  },
  'click #find-places': function () {
    // console.log('se executa');
    var bestPlace;
    var semaphore = 0;
    var places = [];
    var doneWithGroup = false;
    if(Session.get('place-type')){
      if (places.length === 0) {
        Meteor.call('recommendPlaces', Session.get('lon'), Session.get('lat'), Session.get('place-type'), Meteor.user().emails[0].address, Profiles.find({email:Meteor.user().emails[0].address}).fetch()[0].radius, function(err,results){
            // console.log(results.content);
            // Session.set('places',JSON.parse(results.content));
            // places =  Session.get('places');
            semaphore = 1;
            places = results;
        });
      }
    }
    else{
      sweetAlert("Oops...", "You must pick a place type first!", "error");
    }
    var getPlaces = Meteor.setInterval(function(){
      if(semaphore === 1){
        semaphore = 0;
        // console.log(places);
        // console.log(typeof(places));
        if(Group.find().fetch().length != 0)
        {
          Meteor.call('groupProcessing', Group.find().fetch(), places, function(err, results){
            // console.log(results);
              var hash = {};
              results.forEach(function(userPlaces){
                // if(userPlaces.length != 0)
                // console.log(userPlaces);
                userPlaces.forEach(function(place){
                  if(hash[place.place_id] === undefined)
                  {
                    console.log('id'+place.place_id);
                    hash[place.place_id] = place.score;
                  }
                  else
                  {
                    hash[place.place_id] += place.score;
                  }
                });
              console.log(hash);
              var max = 0;
              for (var i in hash)
              {
                if (hash[i] >= max)
                {
                  max = hash[i];
                  bestPlace = i;
                  console.log('in'+bestPlace);
                }
                  console.log('out'+bestPlace);
              }
              });
              doneWithGroup = true;
          });
        }
        else
        {
          var max = 0;
          places.forEach(function(el){
            if (el.score >= max)
            {
              max = el.score;
              bestPlace = el.place_id;
            }
          });

        }
        //Iterating though the given places
        console.log('merge 1')
        if(Group.find().fetch().length === 0)
          if(bestPlace!=undefined)
            {
              console.log('merge 2')
              Meteor.call('getPlaceById', bestPlace, function(err, result) {
                var place = result.result;
                Session.set('recName',place.name);
                Session.set('recAddress',place.adr_address);
                var myLatLng = new google.maps.LatLng(place.geometry.location.lat, place.geometry.location.lng);
                marker = new google.maps.Marker({
                  position: myLatLng,
                  map: GoogleMaps.maps.Map.instance
                });
                GoogleMaps.maps.Map.instance.setCenter(marker.getPosition());
                Meteor.call('updatePlaces', Meteor.user().emails[0].address, place.name, place.types, place.place_id, 0, true);          
                // Meteor.clearInterval(groupPolling);
              });
            }
          else
            sweetAlert("Sorry!", "There are no such places nearby!", "error");
        else
        var groupPolling = Meteor.setInterval(function(){
          if(doneWithGroup){
            // console.log('Best Place' + bestPlace);
            if(bestPlace===undefined)
            {
              sweetAlert("Sorry!", "There are no such places nearby!", "error");
            }
            else
            Meteor.call('getPlaceById', bestPlace, function(err, result) {
              // console.log(result);
              var place = result.result;
              Session.set('recName',place.name);
              Session.set('recAddress',place.adr_address);
              var myLatLng = new google.maps.LatLng(place.geometry.location.lat, place.geometry.location.lng);
              marker = new google.maps.Marker({
                position: myLatLng,
                map: GoogleMaps.maps.Map.instance
              });
              GoogleMaps.maps.Map.instance.setCenter(marker.getPosition());
              // Updating user places
              // if(Group.find().fetch().length === 0)
                // Meteor.call('updatePlaces', Meteor.user().emails[0].address, place.name, place.types, place.place_id, 0, true);
              // else
              // {
              emails = Group.find().fetch();
              emails.push({email: Meteor.user().emails[0].address, gravatar: ''});
              emails.forEach(function(user){
                // console.log(user);
                var oldPlaces = Profiles.find({email: user.email}).fetch()[0].places;
                var isNew = true;
                oldPlaces.forEach(function(place){
                  if (place.place_id === bestPlace)
                    isNew = false;
                });
                if (isNew) {
                  Meteor.call('updatePlaces', user.email, place.name, place.types, place.place_id, 0, true);
                }
              });

              // }
            });
          Meteor.clearInterval(groupPolling);
        }
      },1000);
        Meteor.clearInterval(getPlaces);

        // places.results.forEach(function(el){
        //   // console.log(el);
        //   // // sweetAlert(el.name);
        //   console.log(el.geometry.location.lat+' '+el.geometry.location.lng);

        // });
      }
    }, 1000);

  },
  'click .click-avatar': function (event) {
    $('#hover-friend').html('');
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
  },
  group: function() {
    return Group.find({});
  },
  placeName: function() {
    if (Session.get('recName'))
      return Session.get('recName');
    else
      return '';
  }
});

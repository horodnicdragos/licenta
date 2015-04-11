Template.profile.helpers({
  borrowedBooks: function () {

    var c = Books.find({currentUser: Meteor.user()._id});
    var d = [];

    c.forEach( function(elem) {
      d.push(elem);
    });
    console.log(d);
    return d;
  },
  username: function () {
    if (Meteor.user()) {
      var name = Meteor.user().profile.name || Meteor.user().emails[0].address;
      var city = Meteor.user().profile.city;
      var country = Meteor.user().profile.country;
      var mail = Meteor.user().emails[0].address;
      return {
        'name': name,
        'country': country,
        'city': city,
        'mail': mail
      };
    } else {
      return 'You are not logged in!';
    }


  },

  // borrowedBooks: function () {
  //
  //   var books = [];
  //   var borrowedBooks = Meteor.user().borrowedBooks[0];
  //
  //   console.log('caca', borrowedBooks);
  //
  //   //
  //   // return [
  //   //   {
  //   //     'thumbnail': 'http://placekitten.com/g/200/300/',
  //   //     'daysLeft': '4'
  //   //   },
  //   //   {
  //   //     'thumbnail': 'http://placekitten.com/g/200/300/',
  //   //     'daysLeft': '28'
  //   //   },
  //   //   {
  //   //     'thumbnail': 'http://placekitten.com/g/200/300/',
  //   //     'daysLeft': '11'
  //   //   }
  //   // ];
  // },

  booksRead: function () {
    return '5';
  }
});

Template.profile.events({
  'click #ok-button': function () {

    var name = $('input#name').val().length > 0 ? $('input#name').val() : Meteor.user().profile.name;
    var city = $('input#city').val().length > 0 ? $('input#city').val() : Meteor.user().profile.city;
    var country = $('input#country').val().length > 0 ? $('input#country').val() : Meteor.user().profile.country;
    var mail = $('input#email').val().length > 0 ? $('input#email').val() : Meteor.user().emails[0].address;

    Meteor.users.update({
      _id: Meteor.user()._id
    },
    {
      $set:{
        'profile': {
          'name': name,
          'city': city,
          'country': country,
          'mail': mail,
          'readPoints': 10
        }
      }
    }
  );
  $('input#name').val('');
  $('input#city').val('');
  $('input#country').val('');
  $('input#email').val('');
},
  'click #doneReading': function () {

    var c = $('.progress-bar').css('width');
    c = parseInt(c, 10);
    c = c + ((c * 10)/100);
    var d = $('.progress-bar').css('width', c);
    $('.progress-bar').css('width', c);
    var superid = $('.book').attr('id');
    
    $('#'+superid).addClass('hidden');
    console.log($(this));
  }
});

Template.settings.events({
  'click #ok-button': function(){
    if(Meteor.user()){
    Meteor.call('updateRadius',parseInt($('#radius').val()), Meteor.user().emails[0].address);
    }
  }
});

Template.settings.rendered = function() {
if(Meteor.user())
  $('#radius').val(Profiles.find({email:Meteor.user().emails[0].address}).fetch()[0].radius);
};
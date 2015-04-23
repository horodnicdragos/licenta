Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});

var loginRequired = function() {
  if (! Meteor.user())
    {
      this.render('accessDenied')
    }
  else
    {
      this.next();
    }
}

Router.onBeforeAction(loginRequired, {
    only: ['home', 'profile', 'friends', 'find', 'settings']
});
Router.route('/', {
  name: 'home'
});
Router.route('/profile', {
  name: 'profile'
});
Router.route('/friends', {
  name: 'friends'
});
Router.route('/find', {
  name: 'find'
});
Router.route('/settings/', {
  name: 'settings'
});
Router.route(
  '/submit', {
    name:'bookSubmit'
  }
);

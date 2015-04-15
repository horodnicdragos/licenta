Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
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

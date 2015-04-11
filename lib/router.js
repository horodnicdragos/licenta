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
Router.route('/settings/', {
  name: 'settings'
});
Router.route(
  '/submit', {
    name:'bookSubmit'
  }
);

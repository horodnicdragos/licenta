Books = new Mongo.Collection('books');

Meteor.users.allow({
  update: function(userId, post) {
    return {
      'userId': userId,
      'post': post
    };
  }
});

Profiles = new Mongo.Collection('profiles');



if (Meteor.isServer) {
  Meteor.startup(function () {
    if (!Profiles.find({}).count()) {
      console.log("creating some profiles");
      Profiles.insert({
												email: 'horodnicdragos@yahoo.com',
												places:[{
													name: 'KFC',
													type: 'restaurant',
													place_id: 1,
													rating: 4,
													recent: true,
													visits:{
														date: new Date().valueOf(),
														friends: ['dummy_1@mail.com','dummy_2@mail.com']},
													},
                          {
                          name: "McDonald's",
                          type: 'restaurant',
                          place_id: 2,
                          rating: 3,
                          recent: true,
                          visits:{
                            date: new Date().valueOf(),
                            friends: ['dummy_2@mail.com']},
                          },
                          ],
												friends: ['dummy_1@mail.com','dummy_2@mail.com','dummy_3@mail.com']

      	});
    }
  });
  // Meteor.publish("profiles", function () {
  //   return Profiles.find({});
  // });
}
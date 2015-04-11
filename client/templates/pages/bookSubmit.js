Template.bookSubmit.events({
  'click #submitBook': function () {
    var name = $('.title').text();
    var isbn = $('#searchBook').val();
    var author = $('.author').text();
    var description = $('.description').text();
    var rating = $('.rating').html();
    var image = $('.cover img').attr('src');

    Meteor.users.update({
      _id: Meteor.user()._id
    },
    {
      $addToSet:{
        'books':
          {
            'bookName': name,
            'bookIsbn': isbn,
            'bookAuthor': author,
            'bookDesc': description,
            'bookrating': rating,
            'bookImage': image
          }
      }
    }
  );

  Books.insert({
    'bookName': name,
    'bookIsbn': isbn,
    'bookAuthor': author,
    'bookDesc': description,
    'bookrating': rating,
    'bookImage': image,
    'owner': Meteor.user()._id,
    'currentUser': '',
    'daysLeft': ''
  });
}
});

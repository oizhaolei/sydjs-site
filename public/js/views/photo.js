//- user photo detail
$('document').ready(function() {
  $.ajax({
    url : entry_point
  }).then(function(data) {
    var template = Handlebars.compile($('#photo-template').html());
    $('#user-photo').html(template(data));
  });
  $.ajax({
    url : comment_entry_point
  }).then(function(data) {
    var template = Handlebars.compile($('#photo-comment-template').html());
    $('#user-photo-comment').html(template(data));
  });

});

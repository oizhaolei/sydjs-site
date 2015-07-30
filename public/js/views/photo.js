//- user photo detail
$('document').ready(function() {
  $.ajax({
    url : entry_point
  }).then(function(data) {
    var template = Handlebars.compile($('#photo-template').html());
    $('#user-photo').html(template(data));
  });
});

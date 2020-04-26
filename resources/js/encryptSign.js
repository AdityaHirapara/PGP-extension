function encshow(id) {
  $('.encmodule').hide();
  $(`#${id}`).show();
}

$('#encTab').click(encshow.bind(this, 'encModule'));
$('#signTab').click(encshow.bind(this, 'sign'));
$('#encsignTab').click(encshow.bind(this, 'encsign'));

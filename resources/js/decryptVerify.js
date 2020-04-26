function decshow(id) {
  $('.decmodule').hide();
  $(`#${id}`).show();
}

$('#decTab').click(decshow.bind(this, 'decModule'));
$('#verifyTab').click(decshow.bind(this, 'verify'));
$('#decverTab').click(decshow.bind(this, 'decver'));

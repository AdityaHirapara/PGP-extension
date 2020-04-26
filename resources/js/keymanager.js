function keyshow(id) {
  $('.keymodule').hide();
  $(`#${id}`).show();
}

$('#genkeyform')
  .form({
    fields: {
      genname: {
        identifier: 'genname',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your name'
          }
        ]
      },
      genmail: {
        identifier: 'genmail',
        rules: [
          {
            type   : 'email',
            prompt : 'Please enter valid email'
          }
        ]
      },
      genpassphrase: {
        identifier: 'genpassphrase',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your passphrase'
          }
        ]
      },
    }
  })
;

function generateKeys() {
  if( $('#genkeyform').form('is valid')) {
    const name = $('input[name="genname"]').val();
    const email = $('input[name="genmail"]').val();
    const passphrase = $('input[name="genpassphrase"]').val();

    // openpgp generate key function
  }
}
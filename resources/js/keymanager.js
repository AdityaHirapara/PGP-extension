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



//************************************Nirav start****************************************//
$('#findkeyform')
  .form({
    fields: {
      findname: {
        identifier: 'findname',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your name'
          }
        ]
      },
      findmail: {
        identifier: 'findmail',
        rules: [
          {
            type   : 'email',
            prompt : 'Please enter valid email'
          }
        ]
      },
    }
  })
;

function findKey() {
  console.log('Clicked on find-key');
  if( $('#findkeyform').form('is valid')) {
    const name = $('input[name="findname"]').val();
    const email = $('input[name="findmail"]').val();
    console.log(name);
	console.log(email);
    // openpgp find key function
  }
}

// ************************************Nirav End******************************************//
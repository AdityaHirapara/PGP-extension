function decshow(id) {
  $('.decmodule').hide();
  $(`#${id}`).show();
}

$('#decTab').click(decshow.bind(this, 'decModule'));
$('#verifyTab').click(decshow.bind(this, 'verify'));
$('#decverTab').click(decshow.bind(this, 'decver'));

$('#privUser').dropdown({});

chrome.storage.local.get(function(keys) {
  var userList = document.getElementById("privUserList");

  for(var key in keys) {
    div = document.createElement("div");
    div.className = "item";
    div.dataset.value=key;
    div.innerText += keys[key].name + " (" + key + ")";

    if(keys[key].privKey != undefined) {
      userList.appendChild(div);
    }
  }
});

$('#decform')
  .form({
    fields: {
      user: {
        identifier: 'decUser',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select User'
          }
        ]
      },
      decpassphrase: {
        identifier: 'decpassphrase',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your passphrase'
          }
        ]
      },
      encryptedMessage: {
        identifier: 'encryptedMessage',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter Encrypted Message'
          }
        ]
      }
    }
  })
;

$("#decsubmit").click(decryptMessage);

function decryptMessage() {
	if( $('#decform').form('is valid')) {
    
    const email = $('input[name="decUser"]').val();
    const message = $('textarea[name="encryptedMessage"]').val();
    const password = $('input[name="decpassphrase"]').val();

     decMessage(message, email, password);
  }
}

function decMessage(encMessage, email, password) {
	chrome.storage.local.get(email,function(details){
		const privateKey = openpgp.key.readArmored(details[email].privKey).keys[0];

		decryptKey(privateKey, password).then(function(decryptedKey){
      const decryptedkey = decryptedKey.key;
			var option = {
				message: openpgp.message.readArmored(encMessage),
				privateKey: decryptedkey
			};

			openpgp.decrypt(option).then(function(output){
				console.log("decrypted message = ",output.data);
			});
		});
	});
}

function decryptKey(privatekey, password) {
	var options = {
		privateKey: privatekey,
		passphrase: password
	};

	return openpgp.decryptKey(options);
}
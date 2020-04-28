function decshow(id) {
  $('.decmodule').hide();
  $(`#${id}`).show();
}

$('#decTab').click(decshow.bind(this, 'decModule'));
$('#verifyTab').click(decshow.bind(this, 'verify'));
$('#decverTab').click(decshow.bind(this, 'decver'));

$('#privUser').dropdown({});
$('#pubSender').dropdown({});
$('#privsignUser').dropdown({});
$('#pubsignSender').dropdown({});
chrome.storage.local.get(function(keys) {
  var userList = document.getElementById("privUserList");
  var pubuserList = document.getElementById("pubSenderList");
  var userList2 = document.getElementById("privUserList2");
  var pubuserList2 = document.getElementById("pubSenderList2");
  for(var key in keys) {
    div = document.createElement("div");
    div.className = "item";
    div.dataset.value=key;
    div.innerText += keys[key].name + " (" + key + ")";
    div2 = document.createElement("div");
    div2.className = "item";
    div2.dataset.value=key;
    div2.innerText += keys[key].name + " (" + key + ")";

    if(keys[key].privKey != undefined) {
      userList.appendChild(div);
      userList2.appendChild(div2);

    }
    else  {
      pubuserList.appendChild(div);
      pubuserList2.appendChild(div2);
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
	chrome.storage.local.get(email,async function(details){
		const privateKey =(await openpgp.key.readArmored(details[email].privKey)).keys[0];

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

//verify




$('#verifyform')
  .form({
    fields: {
      user: {
        identifier: 'sender',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select User'
          }
        ]
      },

      recMessage: {
        identifier: 'recMessage',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter Received Message'
          }
        ]
      }
    }
  })
;
$("#versubmit").click(verifyMessage);
function verifyMessage() {
	if( $('#verifyform').form('is valid')) {

    const email = $('input[name="sender"]').val();
    const message = $('textarea[name="recMessage"]').val();
    verMessage(message, email);
  }
}

function verMessage(message, email) {

	chrome.storage.local.get(email,async function(details){

		const pubkey = (await openpgp.key.readArmored(details[email].pubKey)).keys[0];
	    var options = {
			message: await openpgp.message.readArmored(message),
			publicKeys: pubkey
		};
		openpgp.verify(options).then(function(verifyMessage) {
			console.log(verifyMessage.data);

		});
	});
}



//decrypt verifyTab



$('#decverform')
  .form({
    fields: {
      user: {
        identifier: 'decsignUser',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select User'
          }
        ]
      },

      decsignpassphrase: {
        identifier: 'decsignpassphrase',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your passphrase'
          }
        ]
      },
      signsender: {
        identifier: 'signsender',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select User'
          }
        ]
      },
      encryptedMessage: {
        identifier: 'encryptedsignMessage',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter Encrypted Signed Message'
          }
        ]
      }
    }
  })
;




function decryptsignMessage() {
	if( $('#decform').form('is valid')) {

    const user = $('input[name="decsignUser"]').val();
    const message = $('textarea[name="encryptedsignMessage"]').val();
    const password = $('input[name="decsignpassphrase"]').val();
    const sender=$('input[name="signsender"]').val();

     decsignMessage(message, user, password,sender);
  }
}

function decsignMessage(encsignedMessage, user, password,sender) {
  var pubkey;
  chrome.storage.local.get(sender,async function(details){

		pubkey = (await openpgp.key.readArmored(details[sender].pubKey)).keys[0];
  });
	chrome.storage.local.get(user,async function(details){
		const privateKey =(await openpgp.key.readArmored(details[user].privKey)).keys[0];

		decryptKey(privateKey, password).then(async function(decryptedKey){
      const decryptedkey = decryptedKey.key;
			var option = {
				message:await openpgp.message.readArmored(encMessage),
				privateKey: decryptedkey,
        publicKeys: pubkey
			};

			openpgp.decrypt(option).then(function(output){
				console.log("decrypted message = ",output.data);
			});
		});
	});
}

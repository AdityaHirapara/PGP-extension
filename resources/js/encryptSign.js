function encshow(id) {
  $('.encmodule').hide();
  $(`#${id}`).show();
}

$('#encTab').click(encshow.bind(this, 'encModule'));
$('#signTab').click(encshow.bind(this, 'sign'));
$('#encsignTab').click(encshow.bind(this, 'encsign'));

$('#pubRecipient').dropdown({});
$('#signUser').dropdown({});

chrome.storage.local.get(function(keys) {
  var recipientList = document.getElementById("pubRecipientList");
  var recipientList2 = document.getElementById("pubRecipientList2");
  for(var key in keys) {
    div = document.createElement("div");
    div.className = "item";
    div.dataset.value=key;
    div.innerText += keys[key].name + " (" + key + ")";

    if(keys[key].privKey == undefined) {
      recipientList.appendChild(div);
        //recipientList2.appendChild(div);
    }
  }
  for(var key in keys) {
    div = document.createElement("div");
    div.className = "item";
    div.dataset.value=key;
    div.innerText += keys[key].name + " (" + key + ")";

    if(keys[key].privKey != undefined) {
      //console.log(div);
      recipientList2.appendChild(div);
        //recipientList2.appendChild(div);
    }
  }
});
signform
$('#encform')
  .form({
    fields: {
      recipient: {
        identifier: 'recipient',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select recipient'
          }
        ]
      },
      encMessage: {
        identifier: 'encMessage',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter Message'
          }
        ]
      }
    }
  })
;

$("#encsubmit").click(encryptMessage);

function encryptMessage() {
  if( $('#encform').form('is valid')) {

    const email = $('input[name="recipient"]').val();
    const message = $('textarea[name="encMessage"]').val();

    console.log("recipient : ",email);
    console.log("Message : ",message);

    encMessage(message, email);
  }
}

function encMessage(message, email) {

	chrome.storage.local.get(email, async function(details){

		const pubkey = (await openpgp.key.readArmored(details[email].pubKey)).keys[0];

	    var options = {
			message:  openpgp.message.fromText(message),
			publicKeys: pubkey
		};

		openpgp.encrypt(options).then(function(encryptedMessage) {
      console.log(encryptedMessage.data);
		});
	});
}






//sign


$('#signform')
  .form({
    fields: {
      User  : {
        identifier: 'SignUser',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select User'
          }
        ]
      },
      Signpassphrase: {
        identifier: 'Signpassphrase',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter passphrase'
          }
        ]
      },
      message: {
        identifier: 'SignMessage',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter Message'
          }
        ]
      }
    }
  })
;

$("#Signsubmit").click(signmessage);
function signmessage()
{
  if( $('#signform').form('is valid'))
  {
    const email = $('input[name="SignUser"]').val();
    const message = $('textarea[name="SignMessage"]').val();
    const password = $('input[name="Signpassphrase"]').val();
    console.log("SignUser : ",email);
    console.log("Message : ",message);
    sign(message, email,password);
  }
}
function sign(message, email,password)
{
  chrome.storage.local.get(email,function(details){
    const privKey = openpgp.key.readArmored(details[email].privKey).keys[0];
    decryptKey(privKey, password).then(function(decryptedKey){
      const decryptedkey = decryptedKey.key;
    var options = {
    data: message,
    privateKeys: decryptedkey
  };
  openpgp.sign(options).then(function(signmessage) {
    console.log(signmessage.data);
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

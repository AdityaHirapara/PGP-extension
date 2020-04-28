function encshow(id) {
  $('.encmodule').hide();
  $(`#${id}`).show();
}

$('#encTab').click(encshow.bind(this, 'encModule'));
$('#signTab').click(encshow.bind(this, 'sign'));
$('#encsignTab').click(encshow.bind(this, 'encsign'));

$('#pubRecipient').dropdown({});

chrome.storage.local.get(function(keys) {
  var recipientList = document.getElementById("pubRecipientList");

  for(var key in keys) {
    div = document.createElement("div");
    div.className = "item";
    div.dataset.value=key;
    div.innerText += keys[key].name + " (" + key + ")";

    if(keys[key].privKey == undefined) {
      recipientList.appendChild(div);
    }
  }
});

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
    
    // const email = $('input[name="recipient"]').val();
    const email = "rajdetroja@gmail.com";
    const message = $('textarea[name="encMessage"]').val();

    console.log("recipient : ",email);
    console.log("Message : ",message);

    encMessage(message, email);
  }
}

function encMessage(message, email) {

	chrome.storage.local.get(email,function(details){

		const pubkey = openpgp.key.readArmored(details[email].pubKey).keys[0];
	    
	    var options = {
			data: message,
			publicKeys: pubkey
		};

		openpgp.encrypt(options).then(function(encryptedMessage) {
			console.log(encryptedMessage.data);
		});
	});
}

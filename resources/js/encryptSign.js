function encshow(id) {
  $('.encmodule').hide();
  $(`#${id}`).show();
}

$('#encTab').click(encshow.bind(this, 'encModule'));
$('#signTab').click(encshow.bind(this, 'sign'));
$('#encsignTab').click(encshow.bind(this, 'encsign'));

$('#pubRecipient').dropdown({});
$('#pubRecipient2').dropdown({});
$('#signUser').dropdown({});
$('#encsignUser').dropdown({});


chrome.storage.local.get(function(keys) {
  var recipientList = document.getElementById("pubRecipientList");
  var recipientList2 = document.getElementById("privRecipientList");
  var recipientList3 = document.getElementById("pubRecipientList2");
  var recipientList4 = document.getElementById("privRecipientList2");
  for(var key in keys) {
    div = document.createElement("div");
    div.className = "item";
    div.dataset.value=key;
    div.innerText += keys[key].name + " (" + key + ")";
    div2 = document.createElement("div");
    div2.className = "item";
    div2.dataset.value=key;
    div2.innerText += keys[key].name + " (" + key + ")";


    if(keys[key].privKey == undefined) {
      recipientList.appendChild(div);
      recipientList3.appendChild(div2);

    }
    else  {
      //console.log(div);
      recipientList2.appendChild(div);
      recipientList4.appendChild(div2);
        //recipientList2.appendChild(div);

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

    const email = $('input[name="recipient"]').val();
    const message = $('textarea[name="encMessage"]').val();

    console.log("recipient : ",email);
    console.log("Message : ",message);

    encMessage(message, email);
  }
}

function encMessage(message, email) {

	chrome.storage.local.get(email,async function(details){
    try {
      const pubkey =(await openpgp.key.readArmored(details[email].pubKey)).keys[0];

      var options = {
        message: openpgp.message.fromText(message),
        publicKeys: pubkey
      };
    } catch(e) {
      console.log(e.message);
      window.alert("Error occured while reading public key!");
    }
      openpgp.encrypt(options).then(function(encryptedMessage) {
        var encOutput = document.getElementById("encMsg");
        encOutput.innerText = encryptedMessage.data;
        $(".encMsg").show();
      }).catch((e) => {
        if (e.message) {
          window.alert("Error: " + e.message)
        } else {
          window.alert("Error occured while encrypting message!");
        }
      });
	});
}

$('.encMsg').click(function () {
  var content = document.getElementById("encMsg").innerHTML;
  var encryptedMessage = content.replace(/<br>/g, "\n");

  var $temp = $("<textarea>");
  var brRegex = /<br\s*[\/]?>/gi;
  $("body").append($temp);
  $temp.val(encryptedMessage).select();
  document.execCommand("copy");
  $temp.remove();
  $('#encCopyNotify').slideDown().delay(1000).slideUp();
});




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
  chrome.storage.local.get(email,async function(details){
    const privKey = (await openpgp.key.readArmored(details[email].privKey)).keys[0];
    decryptKey(privKey, password).then(function(decryptedKey){
      const decryptedkey = decryptedKey.key;
      var options = {
        message: openpgp.message.fromText(message),
        privateKeys: decryptedkey
      };
      
      openpgp.sign(options).then(function(signmessage) {
        var signOutput = document.getElementById("signMsg");
        signOutput.innerText = signmessage.data;
        $(".signMsg").show();
      }).catch(e => window.alert("Error occured while signing the message!"));
    }).catch(e => window.alert("Invalid passphrase!"));
  });
}

function decryptKey(privatekey, password) {
	var options = {
		privateKey: privatekey,
		passphrase: password
	};

	return openpgp.decryptKey(options);
}

$('.signMsg').click(function () {
  var content = document.getElementById("signMsg").innerHTML;
  var signedMessage = content.replace(/<br>/g, "\n");

  var $temp = $("<textarea>");
  var brRegex = /<br\s*[\/]?>/gi;
  $("body").append($temp);
  $temp.val(signedMessage).select();
  document.execCommand("copy");
  $temp.remove();
  $('#signCopyNotify').slideDown().delay(1000).slideUp();
});



//enc and sign





$('#encsignform')
  .form({
    fields: {
      User  : {
        identifier: 'encSignUser',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select User'
          }
        ]
      },
      User2  : {
        identifier: 'recipientsign',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select User'
          }
        ]
      },
      Signpassphrase: {
        identifier: 'encSignpassphrase',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter passphrase'
          }
        ]
      },
      message: {
        identifier: 'encSignMessage',
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

$("#encSignsubmit").click(encsignmessage);

function encsignmessage()
{

  if( $('#encsignform').form('is valid'))
  {
    const sender = $('input[name="encSignUser"]').val();

    const receiver = $('input[name="recipientsign"]').val();

    const message = $('textarea[name="encSignMessage"]').val();
    const password = $('input[name="encSignpassphrase"]').val();
    console.log("Sender : ",sender);

    console.log("Receiver : ",receiver);
    //console.log("Sender : ",sender);
  //  console.log("Message : ",message);
    encsign(message, sender,receiver,password);
  }
}

function encsign(message, sender,receiver,password) {
  var privKey;
  //var pubkey;
  chrome.storage.local.get(sender,async function(details) {
    privKey = (await openpgp.key.readArmored(details[sender].privKey)).keys[0];
  });

  chrome.storage.local.get(receiver,async function(details) {
    
    const pubkey = (await openpgp.key.readArmored(details[receiver].pubKey)).keys[0];
    
    decryptKey(privKey, password).then(function(decryptedKey) {
      
      const decryptedkey = decryptedKey.key;
      
      var options = {
 			  message: openpgp.message.fromText(message),
        publicKeys: pubkey,
        privateKeys: decryptedkey
      };
      
      openpgp.encrypt(options).then(function(encsignmessage) {
 			  var encSignOutput = document.getElementById("encSignMsg");
        encSignOutput.innerText = encsignmessage.data;
        $(".encSignMsg").show();
      }).catch(e => window.alert("Error occured while encryption and signing the message!"));
    }).catch(e => window.alert("Invalid passphrase!"));
  });
}

$('.encSignMsg').click(function () {
  var content = document.getElementById("encSignMsg").innerHTML;
  var encryptSignedMessage = content.replace(/<br>/g, "\n");

  var $temp = $("<textarea>");
  var brRegex = /<br\s*[\/]?>/gi;
  $("body").append($temp);
  $temp.val(encryptSignedMessage).select();
  document.execCommand("copy");
  $temp.remove();
  $('#encSignCopyNotify').slideDown().delay(1000).slideUp();
});

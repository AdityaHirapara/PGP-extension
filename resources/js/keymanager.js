function keyshow(id) {
  $('.keymodule').hide();
  $(`#${id}`).show();
}

$('#genkeyTab').click(keyshow.bind(this, 'genkey'));
$('#findkeyTab').click(keyshow.bind(this, 'find'));
$('#managekeyTab').click(keyshow.bind(this, 'manage'));

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

$("#gensubmit").click(generateKeys);

function newKeyPair(name, email, password) {
	var options = {
		userIds: [{
			name: name,
			email: email
		}],
		numBits: 4096,
		passphrase: password
	}

	openpgp.generateKey(options).then(function(key) {
		console.log(key.key.primaryKey.getAlgorithmInfo());
		storeKeyPair(name, email,
					 key.publicKeyArmored,
           key.privateKeyArmored,
           key.revocationCertificate,
           key.key.primaryKey);
  }).catch(() => window.alert('Something went wrong while generating key! try again'));
}

async function storeKeyPair(name, email, pubKey, privKey, revCert, primaryKey) {
	var details = {};
	details[email] = {
		"name": name,
    "email" : email,
		"pubKey": pubKey,
    "privKey": privKey,
    "revocationCert": revCert,
    "keyId": '0x' + primaryKey.getKeyId().toHex(),
    "creation": primaryKey.getCreationTime().toLocaleString(),
    "algorithm": primaryKey.getAlgorithmInfo().algorithm,
    "size": primaryKey.getAlgorithmInfo().bits,
    "revoked": false,
    "sent": false
  };
	chrome.storage.local.set(details, function() {
		console.log("Stored key pair at", email);
		$('#keysendmodal').modal({
      onApprove: function() {
        $('#sendmodalbutton').addClass('loading');
        const hkp = new openpgp.HKP('https://keyserver.ubuntu.com');
        hkp.upload(pubKey).then(function(l) {
          if (l.status == 200) {
            details[email].sent = true;
            chrome.storage.local.set(details, function() {
              window.location.reload();
            });
          } else {
            throw new Error();
          }
        }).catch(() => window.alert('Error occured while uploading key! check your connection and try again.'));
      },
      onDeny: function() {
        window.location.reload();
      }
    }).modal('show');
	});
}

function generateKeys() {
  if( $('#genkeyform').form('is valid')) {
    const name = $('input[name="genname"]').val();
    const email = $('input[name="genmail"]').val();
    const passphrase = $('input[name="genpassphrase"]').val();

    $('#gensubmit').addClass('loading');
    chrome.storage.local.get(email, function(details) {
      if (!details[email]) {
        newKeyPair(name, email, passphrase);
      } else {
        window.alert('Sorry! Muliple keys with one email is not allowed!');
        $('#gensubmit').removeClass('loading');
        $('#genkeyform').form('clear')
      }
    })
  }
}

//************************************Nirav start****************************************//

$("#importkeybutton").click(importKey);
$("#findkeybutton").click(findKey);
$('#findkeyform')
  .form({
    fields: {
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
$('#importkeyform')
  .form({
    fields: {
      importpublickey: {
        identifier: 'importpublickey',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter valid PublicKey'
          }
        ]
      },
    }
  })
;
function storeKey(name, email, pubKey, primaryKey) {
	var details = {};
	details[email] = {
		"name": name,
    "email": email,
    "pubKey": pubKey,
    "keyId": '0x' + primaryKey.getKeyId().toHex(),
    "creation": primaryKey.getCreationTime().toLocaleString(),
    "algorithm": primaryKey.getAlgorithmInfo().algorithm,
    "size": primaryKey.getAlgorithmInfo().bits,
  };
  
	chrome.storage.local.set(details, function() {
		console.log("Stored key at", email);
    $('#findkeybutton').removeClass('loading');
    window.location.reload();
	});
}



function findKey() {
	console.log('Clicked on Find button')
	if($('#findkeyform').form('is valid')) {
    var email = $('input[name="findmail"]').val();
    $('#findkeybutton').addClass('loading');
    chrome.storage.local.get(email, function(details) {
      if (!details[email]) {
        var hkp = new openpgp.HKP('https://keyserver.ubuntu.com');
        var options = {
          query: email
        };
        hkp.lookup(options).then(async function(key) {
          var publicKey = await openpgp.key.readArmored(key);
          console.log(publicKey)
          if (publicKey.keys.length > 1) {

          } else {
            var userid = publicKey['keys'][0]['users'][0].userId['userid'].split(' ');
            var name='';
            for (i = 0; i < userid.length-1; i++) {
              name += userid[i] + " ";
            }
            storeKey(name, email, key, publicKey.keys[0].primaryKey);
            alert('Key added Successfully');
          }
        }).catch(e => {
          if (e.message == 'Not found') {
            window.alert('Keyserver having trouble looking for ' + email);
          } else {
            window.alert('Something went wrong while fetching key');
          }
          $('#findkeybutton').removeClass('loading');
          $('#findkeyform').form('clear');
        });
      } else {
        window.alert('Sorry! Muliple keys with one email is not allowed!');
        $('#findkeybutton').removeClass('loading');
        $('#findkeyform').form('clear');
      }
    })
	}
}


function handleFileSelect(evt) {
    var i,files = evt.target.files[0]; // FileList object
	var reader = new FileReader();
	reader.onload = (function(theFile) {
		return function(e) {
		  var span = document.createElement('span');
		  span.innerHTML = ['<textarea class="ui message" disable>'+e.target.result+'</textarea>'].join('');
		  document.getElementById('importpublickey').innerHTML=e.target.result;
		};
	})(files);
	reader.readAsText(files);
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);


async function importKey() {
	console.log('Clicked on Import Public Key button')
	if( $('#importkeyform').form('is valid')) {
    var publickey = $.trim($("textarea").val());
		verifypubandsave(publickey);
	}
}

async function verifypubandsave(pubkey){
	try{
		var pubKey = await openpgp.key.readArmored(pubkey);
		var userid = pubKey['keys'][0]['users'][0].userId['userid'];
		userid = userid.split(' ');
		var name='';
		for (i = 0; i < userid.length-1; i++) {
			name += userid[i] + " ";
		}
		email = userid[userid.length-1].replace('<', '').replace('>', '');
		console.log('Name from public key: ',name);
    console.log('Email from public key: ',email);
    chrome.storage.local.get(email, function(details) {
      if (!details[email]) {
		    storeKey(name, email, key, pubKey.keys[0].primaryKey);
        alert('Your Public Key stored Successfully');
      } else {
        window.alert('Sorry! Muliple keys with one email is not allowed!');
        $('#importkeyform').form('clear')
      }
    });
	}catch(err){
		alert('Invalid Public Key');
	}
}



// ************************************Nirav End******************************************//

function download(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  pom.style.display = 'none';
  document.body.appendChild(pom);

  pom.click();

  document.body.removeChild(pom);
}


function send(email) {
  $('#sendkeyprop').empty()
                  .append("<div> Do you want to send public key of "+email+" to Keyserver?</div>");
  $('#sendkeymodal').modal({
    onApprove: function() {
      const hkp = new openpgp.HKP('https://keyserver.ubuntu.com');
      hkp.upload(pubprivkeyarr[email].pubKey).then(function(l) {
        if(l['status']==200){
          chrome.storage.local.get(email, async function(details){
            for(var k in details){
              details[k].sent = true;
              chrome.storage.local.remove(email);
              chrome.storage.local.set(details, function() {});
              var id = '#'+email.replace('@','-at-').replace('.','-dot-')+"-send";
              $(id).hide();
              window.alert('Public Key sent Successfully'+k);
              break;
            }
          });
        }else{
          console.log('Something Went wrong.!.Error code '+l['status'])
          window.alert('Something Went wrong uploading key to keysever! Check your connection and try again.');
        }
      }).catch(() => {
        window.alert('Something Went wrong! try again later.');
      });
    },
    onDeny: function() {
      $('#sendkeymodal').modal('hide');
    }
  }).modal('show');
}

function revoke(email) {
  $('#revokekeymodal').modal({
    onApprove: function() {
      chrome.storage.local.get(email, async function(details) {
        // console.log(details[email].pubKey)
        var options = {
          key: (await openpgp.key.readArmored(details[email].pubKey)).keys[0],
          revocationCertificate: details[email].revocationCert
        };
        openpgp.revokeKey(options).then(function(key) {
          console.log(key)
          var pubkey = key.publicKeyArmored;
          console.log(pubkey)
          const hkp = new openpgp.HKP('https://keyserver.ubuntu.com');
          hkp.upload(pubkey).then(function(l) {
            if(l['status']==200){
              console.log(l)
              details[email].revoked = true;
              details[email].pubKey = pubkey;
              chrome.storage.local.set(details, function() {
                var id = '#'+email.replace('@','-at-').replace('.','-dot-')+"-revoke";
                $(id).hide();
                id = '#'+email.replace('@','-at-').replace('.','-dot-')+"-remove";
                $(id).show();
                window.alert('Keypair revoked Successfully');
              });
            } else {
              throw new Error();
            }
          }).catch(() => window.alert('Something Went wrong uploading revoked key to keysever! Check your connection and try again.'));
        }).catch(() => window.alert('Something went wrong! try again later'));
      });
    },
  }).modal('show');
}
function fetchAnyKey(email) {
  const hkp = new openpgp.HKP('https://keyserver.ubuntu.com');

  var options = {
    query: email
  };
  hkp.lookup(options).then(async function(key) {
    var publicKey = await openpgp.key.readArmored(key);
    console.log(publicKey)
    console.log(key)
  });
}

function deletePair(email) {
  //only if revoked
  $('#deletekeyprop').empty()
                  .append("<div> Do you want to remove public key and private key pair of "+email+"</div>");
  $('#deletekeymodal').modal({
    onApprove: function() {
      chrome.storage.local.remove(email);
      pubprivkeyarr[email] = null;
      var id = "#"+email.replace("@","-at-").replace(".","-dot-")+"-div";
      $(id).remove();
      window.alert('Key Pair of '+email+' is removed Successfully');
    },
    onDeny: function() {
      $('#deletekeymodal').modal('hide');
    }
  }).modal('show');
}

function downloadCert(email) {
  chrome.storage.local.get(email, function(details) {
    download('revocationCertificate.asc', details[email].revocationCert);
  });
}

function downloadKeyPair(email) {
  chrome.storage.local.get(email, function(details) {
    download('publicKey.gpg', details[email].pubKey);
    download('privateKey.gpg', details[email].privKey);
  });
}

function showPairProperty(email) {
  console.log(pubprivkeyarr[email].creation)
    $('#properties').empty()
                    .append("<div> Email: "+email+"</div>")
                    .append("<div> Name: "+pubprivkeyarr[email].name+"</div>")
                    .append("<div> keyID: "+pubprivkeyarr[email].keyId+"</div>")
                    .append("<div> Creation Time: "+pubprivkeyarr[email].creation+"</div>")
                    .append("<div> Algorithm: "+pubprivkeyarr[email].algorithm+"</div>")
                    .append("<div> Size: "+pubprivkeyarr[email].size+"</div>")
                    .append("<div> Revoke: "+pubprivkeyarr[email].revoked+"</div>")
                    .append("<div> Sent: "+pubprivkeyarr[email].sent+"</div>");
    $('#propmodal').modal('show');
}

function downloadPubKey(email) {
  chrome.storage.local.get(email, function(details) {
    download('publicKey.gpg', details[email].pubKey);
  });
}

function deletePubKey(email) {
  $('#deletekeyprop').empty()
                     .append("<div> Do you want to remove public key of "+email+"</div>");
  $('#deletekeymodal').modal({
    onApprove: function() {
      chrome.storage.local.remove(email);
      pubkeyarr[email] = null;
      var id = "#"+email.replace("@","-at-").replace(".","-dot-")+"-div";
      $(id).remove();
      window.alert('Public Key of '+email+' is removed Successfully');
    },
    onDeny: function() {
      $('#deletekeymodal').modal('hide');
    }
  }).modal('show');
}

function showKeyProperty(email) {
  $('#properties').empty()
                  .append("<div> Email: "+email+"</div>")
                  .append("<div> Name: "+pubkeyarr[email].name+"</div>")
                  .append("<div> keyID: "+pubkeyarr[email].keyId+"</div>")
                  .append("<div> Creation Time: "+pubkeyarr[email].creation+"</div>")
                  .append("<div> Algorithm: "+pubkeyarr[email].algorithm+"</div>")
                  .append("<div> Size: "+pubkeyarr[email].size+"</div>");
  $('#propmodal').modal('show');
}

function generatePrivElement(email, name, id, sent, revoked) {
  return `<div id="${id}-div" class="ui grid keyItem" style="align-items: center; border-bottom: .3px solid #d2d2d2;">
    <div class="ten wide column" style="display: flex;align-items: center;">
      <img height="30px" src="resources/images/privatekey.png" style="padding-right: 5px;">
      ${name} (${email})
    </div>
    <div class="one wide column">
      <button id="${id}-send" class="ui compact icon blue button" data-content="Send to Keyserver" style="display: ${sent? 'none': 'box'}">
        <i class="cloud upload icon"></i>
      </button>
    </div>
    <div class="one wide column">
      <button id="${id}-download" class="ui compact icon blue button" data-content="Download Keypair">
        <i class="download icon"></i>
      </button>
    </div>
    <div class="one wide column">
      <button id="${id}-cert" class="ui compact icon blue button" data-content="Download Revocation certificate" style="padding: .3rem;">
        <img width="24px" height="20px" src="resources/images/cert.png">
      </button>
    </div>
    <div class="one wide column">
      <button id="${id}-revoke" class="ui compact icon red button" data-content="Revoke your key" style="padding: .3rem .4rem; display: ${revoked? 'none': 'box'}">
        <img width="20px" src="resources/images/revoke1.png">
      </button>
      <button id="${id}-remove" class="ui compact icon red button" data-content="Delete revoked key" style="display: ${revoked? 'box': 'none'}">
        <i class="trash icon"></i>
      </button>
    </div>
    <div class="one wide column">
      <button id="${id}-prop" class="ui compact icon yellow button" data-content="See properties">
        <i class="list alternate white icon"></i>
      </button>
    </div>
  </div>`;
}

function generatePubElement(email, name, id) {
  return `<div id="${id}-div"  class="ui grid keyItem" style="align-items: center; border-bottom: .3px solid #d2d2d2;">
    <div class="twelve wide column" style="display: flex;align-items: center;">
      <img height="30px" src="resources/images/publickey.png" style="padding-right: 5px;">
      ${name} (${email})
    </div>
    <div class="one wide column">
      <button id="${id}-download" class="ui compact icon blue button" data-content="Download key">
        <i class="download icon"></i>
      </button>
    </div>
    <div class="one wide column">
      <button id="${id}-remove" class="ui compact icon red button" data-content="Remove key">
        <i class="trash icon"></i>
      </button>
    </div>
    <div class="one wide column">
      <button id="${id}-prop" class="ui compact icon yellow button" data-content="See properties">
        <i class="list alternate white icon"></i>
      </button>
    </div>
  </div>`;
}
//storeKey('kiran','kiran@gmail.com','pubkiranbogus');
//storeKey('maran','maran@gmail.com','pubmaranbogus');
//storeKey('3maran','3maran@gmail.com','3pubmaranbogus');
//storeKey('4maran','4maran@gmail.com','4pubmaranbogus');
pubkeyarr=[];
pubprivkeyarr=[];
chrome.storage.local.get(function(keys) {
  var pubList = document.getElementById("pubEmail");
  var pubPrivList = document.getElementById("pubPrivEmail");
  for(var key in keys) {
    var id = key.replace('@','-at-').replace('.','-dot-');
    if(keys[key].privKey == undefined) {
      var listItem = generatePubElement(key, keys[key].name, id);
      var container = document.createElement("div");
      container.innerHTML = listItem;

      pubkeyarr[key]=keys[key];
      pubList.appendChild(container);

      $(`#${id}-download`).click(downloadPubKey.bind(this, key));
      $(`#${id}-remove`).click(deletePubKey.bind(this, key));
      $(`#${id}-prop`).click(showKeyProperty.bind(this, key));
    } else {
      var listItem = generatePrivElement(key, keys[key].name, id, keys[key].sent, keys[key].revoked);
      var container = document.createElement("div");
      container.innerHTML = listItem;
      pubprivkeyarr[key] = keys[key];
      pubPrivList.appendChild(container);

      $(`#${id}-send`).click(send.bind(this, key));
      $(`#${id}-revoke`).click(revoke.bind(this, key));
      $(`#${id}-remove`).click(deletePair.bind(this, key));
      $(`#${id}-cert`).click(downloadCert.bind(this, key));
      $(`#${id}-download`).click(downloadKeyPair.bind(this, key));
      $(`#${id}-prop`).click(showPairProperty.bind(this, key));
    }
  }

  $('.icon.button')
  .popup()
  ;
  console.log('pubkeyarr ',pubkeyarr);
  console.log('pubprivkeyarr ',pubprivkeyarr);

});

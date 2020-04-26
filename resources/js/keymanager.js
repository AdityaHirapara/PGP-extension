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
function storeKey(name, email, pubKey) {
	var details = {};
	details[email] = {
		"name": name,
		"pubKey": pubKey
	};
	chrome.storage.local.set(details, function() {
		console.log("Stored key at", email);
		window.location.reload();
	});
}

function findKey() {
	console.log('Clicked on Find button')
	if( $('#findkeyform').form('is valid')) {
		var email = 'mahishmatiradadiya1290347856@kotmail.com'
		var email = $('input[name="findmail"]').val();
		var hkp = new openpgp.HKP('https://keyserver.ubuntu.com/');
		var options = {
			query: email 
		};
		hkp.lookup(options).then(async function(key) {
			var publicKey = await openpgp.key.readArmored(key);
			var userid = publicKey['keys'][0]['users'][0].userId['userid'].split(' ');
			var name='';
			for (i = 0; i < userid.length-1; i++) {
				name += userid[i] + " ";
			}
			storeKey(name, email, key);
		});
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

function verifypubandsave(pubkey){
	try{
		var pubKey = openpgp.key.readArmored(pubkey);
		var userid = pubKey['keys'][0]['users'][0].userId['userid'];
		userid = userid.split(' ');
		var name='';
		for (i = 0; i < userid.length-1; i++) {
			name += userid[i] + " ";
		}
		email = userid[userid.length-1];
		console.log('Name from public key: ',name);
		console.log('Email from public key: ',email);
		storeKey(name, email, key);
		alert('Your Public Key stored Successfully');
	}catch(err){
		alert('Invalid Public Key');
	}
}

// ************************************Nirav End******************************************//
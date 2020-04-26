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
		console.log("Generated key pair");
		storeKeyPair(name, email,
					 key.publicKeyArmored,
					 key.privateKeyArmored);
	});
}

function storeKeyPair(name, email, pubKey, privKey) {
	var details = {};
	details[email] = {
		"name": name,
		"pubKey": pubKey,
		"privKey": privKey
	};
	chrome.storage.local.set(details, function() {
		console.log("Stored key pair at", email);
		$('#keysendmodal').modal({
      onApprove : function() {
        const hkp = new openpgp.HKP('https://keyserver.ubuntu.com');
        hkp.upload(pubKey).then(function(l) { 
          console.log(l)
          var options = {
            query: email
          };
        
          hkp.lookup(options).then(async function(key) {
              var pub = await openpgp.key.readArmored(key);
              console.log(key);
              console.log(pub);
          });
        });
      }
    }).modal('show');
	});
}

function generateKeys() {
  if( $('#genkeyform').form('is valid')) {
    const name = $('input[name="genname"]').val();
    const email = $('input[name="genmail"]').val();
    const passphrase = $('input[name="genpassphrase"]').val();

    newKeyPair(name, email, passphrase);
  }
}
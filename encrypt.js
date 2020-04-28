async function encrypt(message, publicKeys, decryptedKey) {
	for(var i = 0; i < publicKeys.length; i++) {
		publicKeys[i] = (await openpgp.key.readArmored(publicKeys[i])).keys[0];
	}
	var options = {
		message: openpgp.message.fromText(message),
		publicKeys: publicKeys,
		privateKeys: decryptedKey.key
	};

	return openpgp.encrypt(options);
}

async function decryptKey(privateKey, password) {
	var options = {
		privateKey: (await openpgp.key.readArmored(privateKey)).keys[0],
		passphrase: password
	};

	return openpgp.decryptKey(options);
}

async function decrypt(cipher, publicKey, decryptedKey) {
	options = {
		message: await openpgp.message.readArmored(cipher),
		publicKeys: (await openpgp.key.readArmored(publicKey)).keys[0],
		privateKeys: decryptedKey.key
	};

	return openpgp.decrypt(options);
}

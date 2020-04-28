InboxSDK.load('1.0', 'sdk_PGPmail_b4932b6799').then(function(sdk) {
	function passwordPrompt(callback) {
		// Set popup box base
		var div = document.createElement("div");
		div.id = "passphrasePopup";
		div.style = "z-index: 99; \
                     width: 230px; \
                     height: 80px; \
                     padding: 10px 10px 30px 10px; \
                     background-color: #f1f1f1; \
                     background-image: -webkit-linear-gradient(top,#f5f5f5,#f1f1f1); \
                     position: absolute; \
                     top: 50%; \
                     left: 50%; \
                     margin: -70px 0 0 -170px; \
                     display: block; \
                     border: 1px solid rgba(0,0,0,0.1);"

		// Set title
		var pwTitle = document.createElement("h3");
		pwTitle.style = "margin: 5px";
		pwTitle.innerHTML = "Enter Passphrase";

		// Password input box
		var input = document.createElement("input");
		input.id="pgpPassphrase";
		input.className = "gbqfif";
		input.style = "border: 1px solid rgba(0,0,0,0.1); \
                       margin: 5px; \
                       z-index: 6; \
                       left: 0px;";
		input.type = "password";

		// Finished button
		var button = document.createElement("button");
		button.innerHTML = "Done";
		button.className = "T-I T-I-KE";
		button.style = "margin: 5px";
		button.onclick = callback;
		div.appendChild(pwTitle);
		div.appendChild(input);
		div.appendChild(button);
		document.body.appendChild(div);

		// Auto focus input box
		input.focus();
		input.select();
	}

	sdk.Compose.registerComposeViewHandler(function(composeView) {
		// Secure send button
		composeView.addButton({
			title: "Secure Send",
			iconClass: "encryptButton",
			iconUrl: chrome.extension.getURL("resources/images/encryptButton.png"),
			onClick: function(clickEvent) {
				var address = composeView.getToRecipients().concat(composeView.getCcRecipients());
				chrome.storage.local.get(function(keys) {
					var pubKeys = [];
					// Create list of public keys the message is to be sent to
					for(var i = 0; i < address.length; i++) {
						if (!keys[address[i].emailAddress]) {
							return window.alert(`Please fetch public key of "${address[i].emailAddress}" first! Click on extension icon on addressbar.`);
						}
						pubKeys = pubKeys.concat(keys[address[i].emailAddress].pubKey);
					}

					if (!keys[sdk.User.getEmailAddress()]) {
						return window.alert(`Please generate keypair for "${sdk.User.getEmailAddress()}" first! Click on extension icon on addressbar.`);
					}
					// Fire password prompt for signing the message
					passwordPrompt(function() {
						var passphrase = document.getElementById("pgpPassphrase").value;
						document.getElementById("passphrasePopup").remove();

						decryptKey(keys[sdk.User.getEmailAddress()].privKey, passphrase)
							.then(function(decryptedKey) {
								encrypt(composeView.getHTMLContent(), pubKeys, decryptedKey)
									.then(function(ciphertext) {
										// Break up encrypted contents line by line
									    var html = "";
									    var lines = ciphertext.data.split("\n");
									    for(line in lines) {
									    	html += lines[line] + "<br>";
									    }
										// Auto send
									    composeView.setBodyHTML(html);
									    composeView.send();
									}).catch(e => window.alert("Something went wrong!"));
							}).catch(e => window.alert("Invalid passphrase!"));
					});
				});
			}
		});

		// Add/remove button based on if message is being sent to someone who's public key we know
		var encryptButton = document.getElementsByClassName("inboxsdk__button")[0];
		encryptButton.style = "display: none";
		composeView.on("recipientsChanged", function(event) {
			chrome.storage.local.get(function(keys) {
				if(canEncrypt(keys)) {
					encryptButton.style = "";
				} else {
					encryptButton.style = "display: none";
				}
			});
		});

		// Check if we have recipients public keys
		function canEncrypt(keys) {
			// Don't encrypt if people BCC'd
			if(composeView.getBccRecipients().length !== 0) {
				return false;
			}
			var recipients = composeView.getToRecipients().concat(composeView.getCcRecipients());
			var ownedKeys = 0;
			for(var i = 0; i < recipients.length; i++) {
				if(keys[recipients[i].emailAddress] !== undefined) {
					ownedKeys++;
				}
			}
			if(ownedKeys < recipients.length || ownedKeys === 0) {
				return false;
			}
			return true;
		}
	});

	// Monitor each message in thread
	sdk.Conversations.registerThreadViewHandler(function(threadView) {
		var messageViews = threadView.getMessageViewsAll();
		for(var i = 0; i < messageViews.length; i++) {
			messageViews[i].on("load", function(event) {
				// Add button conditionally
				var message = event.messageView.getBodyElement();
				var rawMessage = message.textContent || message.innerText || "";
				var isEncrypted = /-----BEGIN PGP MESSAGE-----(.*\n)*-----END PGP MESSAGE-----/g;
				// Check for armor
				if(isEncrypted.test(rawMessage)) {
					var button = document.createElement('div');
					button.innerHTML = "Decrypt";
					button.id = "PGPextensionDec";
					button.style = `display: inline-block;
						min-height: 1em;
						outline: 0;
						border: none;
						vertical-align: baseline;
						font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
						margin: 0 .25em 0 0;
						padding: .78571429em 1.5em .78571429em;
						text-transform: none;
						font-weight: 700;
						line-height: 1em;
						font-style: normal;
						text-align: center;
						text-decoration: none;
						border-radius: .28571429rem;
						background-color: #2185d0;
						color: #fff;
						text-shadow: none;
						cursor: pointer;
					`;
					var html = button.outerHTML + '<br/>' + message.outerHTML;
					document.getElementById(message.id).firstChild.innerHTML = html;

					button = document.getElementById('PGPextensionDec');
					button.addEventListener('click', function() {
						var message = event.messageView.getBodyElement();
						var rawMessage = message.textContent || message.innerText || "";
						rawMessage = rawMessage.split('Decrypt').splice(1).join('');

						chrome.storage.local.get(sdk.User.getEmailAddress(), function(keys) {
							// Get password for private key
							passwordPrompt(function() {
								var passphrase = document.getElementById("pgpPassphrase").value;
								document.getElementById("passphrasePopup").remove();

								var key = keys[sdk.User.getEmailAddress()];
								decryptKey(key["privKey"], passphrase).then(function(decryptedKey) {
									// Get public key of sender for verification
									var sender = event.messageView.getSender().emailAddress;
									chrome.storage.local.get(sender, function(keys) {
										var sigKey = keys[sender];
										if (!sigKey) {
											return window.alert(`Please fetch public key of "${sender}" first! Click on extension icon on addressbar.`);
										}

										decrypt(rawMessage, sigKey["pubKey"], decryptedKey)
											.then(function(plaintext) {
												var html = "";
												// Display verified box is signing was successfully verified
												try {
													if(plaintext.signatures[0].valid) {
														html += "<h4 style='background-color: #FCF8E3; border: 1px solid rgba(0, 0, 0, 0.0980392); padding: 10px'>Message has been verified <img src="+chrome.extension.getURL("resources/images/verified.png")+" style='height:15px'></h4>";
													}
												} catch(e) {
													console.log("Not valid");
													window.alert("Received data is corrupted!");
												}
												// Display message where encrypted message was
												var lines = plaintext.data.split("\n");
												for(line in lines) {
													html += lines[line] + "<br>";
												}
												document.getElementById(message.id).firstChild.innerHTML = html;
											}).catch(e => window.alert("Received data is corrupted!"));;
									});
								}).catch(e => window.alert("Invalid passphrase!"));
							});
						});
					})
				}
			});
		}
	});
});

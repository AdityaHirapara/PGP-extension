$('.ui.menu')
  .on('click', '.item', function() {
    $(this)
      .addClass('active')
      .siblings('.item')
        .removeClass('active');
});

function show(id) {
  $('.module').hide();
  $(`#${id}`).show();
}

$('#keyTab').click(show.bind(this, 'key'));
$('#encryptTab').click(show.bind(this, 'encrypt'));
$('#decryptTab').click(show.bind(this, 'decrypt'));

console.log(chrome.storage)

// var pubkey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
// Version: OpenPGP.js v2.5.1
// Comment: http://openpgpjs.org

// xsFNBF6kh+4BEACwhE6DJrkoi6y41NxHQaccbtn+tmzM++ZNVH6GAnfEnPQn
// zexw/FQQIlwmZGrWJJOVHnQKjZ3jZhItIefil0VYr9fpOD6floKCnxTgx4JQ
// EgRkzcir3rnmJ6gvR4occiCMzkRIPS0zYdcK9ZRrHLSzzdpnJS2YQ7Zo/p1x
// IVb7wHS6KK2sktNH14aSNoj0/T/6c8qYGy9mbi6TPAonqXlyLA5KWV9gPwWS
// cLjVNjYSS0EFe+jR5QG8q8TW4zoHYDZVNE5EjSGmPWZl7CdSzg2GN32+M9Pr
// XV2uxRbrtvVHKwuaWGE0GTYQMTKyNObh8CZmKiwlZtZ7mDx31p5PSBw+TrGC
// LY5xQCfgi3hhxPNH4XVPrlW1tMOj2OosS7iR0Qo0lElkegMqWVMasHWMEWVd
// 0tPx8se8uB+mu2cRSTTIpUaOT9peuk/btgyPzw36QH193KJpEnkeMv0J8GSF
// GeRCLouiIxidMQcNmNysy6fW+Zy55tgnB8lEeByAYEI3UAveiGW5HbSFPyNr
// 5mru3uxfpmFZXhPZ8GtPKIhTOqcTqCnBIAyr4a0sAKalFyrPlEopN/GhEbu1
// 32AAx60OCc07XxHkaC96hYOjHf2CxuwWI0eCPXLAdLgRa5SCniosXB0cEthB
// /7ZCorwNHqGR8MOFky8gDpE8Nr7y007pmVX2cwARAQABzT5NYWhpc2htYXRp
// IFJhZGFkaXlhIDxtYWhpc2htYXRpcmFkYWRpeWExMjkwMzQ3ODU2QGtvdG1h
// aWwuY29tPsLBdQQQAQgAKQUCXqSH8gYLCQcIAwIJEG5xicDpogPHBBUICgID
// FgIBAhkBAhsDAh4BAACyRQ//Y4uq456gezofQVuv8Gsrfp55+b8wNawIkQtI
// zL92vznrR8rNqnU4ipXxA46nTxgwkMUBfXnj50WZCEVIvy7Afka1wa8LKGsA
// LHfJTTo2wTB8TIXjEybVyNnLmZEuXsfdGB0PRX3wdIGUO/QNKxBQ/NXApmWY
// TQpfTw78oxdYM5/Ih22WWnxOgk72iANRQS3cIr4/F1/lI1XTYoZiLFq0XWZO
// naiReioBsogJwNzr+29yye2Dfye8VMvg36dAOG5X+httS+E8De0kdpCjooPa
// Rfb0PmCl44yWc/29a+dE/IUblETM1M6jGF7xQx3T/4HFRDval4ixvxohTzG6
// THVSifWx5BZT0l6Q7X1FlndwJkE4UIpjK+e2DpCiUq1hI0eVdknBTSCUQ2aY
// IzhyzbYDz1h+fDL7z812MSsHRdB0a8ZeEilCPlfI2wmb2tuyTUF4APHx88yM
// 4AqO1gbKYrV6CuRr6NppjZk8s716fXexSPZJHJJvrCugZQLS20vJNKDZqtwR
// 9r0FOQ+3tGaKC54y3AyUK999uaDWJS/IAiQ0++TweUW7hL+ridJrR0z5GxZY
// U/v0bVrwuwThhUeJAUh4GPMyBZ6dmE23Q/W9/gNJoLg2dVcntPq2zW018BhY
// 4MtkQhSBP5MmAF2cEIZXAUOlimKPsgvgSOOXMXUSdPHu+PPOwU0EXqSH7gEQ
// ANM1G0Kp/GKI3EMkIkDXbJCMqEYtI4pCi8/3j9NSXGMgkpsnf3bD8mECHj9m
// m8L7SHLblm09U77vyjGxZL1AIQfqydwqZcdRSyQaMvU6GvPr7v5GeS92gWjb
// 1UzCv+LvQRAwkHLRHgD9ivDDaw9Qf0hoZZ/LLjFmdgy68wMrFwa8+Ok++zV8
// 5WWkWQf4A+lAydj9jKBtKACY2X8RhLh0DiyTS2zHg70sqYqJprdwQ3HSyZWA
// vGDNd/+EEHQbwdQoc1XcDpfvjDeLKUrh7NwIHKHG5VaVLPpn6I9nUZ/d+WV+
// gRWOFS8SrIl3MBmKYCB/vjnPNGQlr2frrXXmDG06S2KqmW/u0Y+C2gGbQUwq
// r1thSKAnBJMuRhc+9yhbQhUNqsbbE1kbKpxoM/OZA322RE1exHy7QoTW+LSX
// Zrlv7BlxlOJTRzBY+VBf569xCedwfA54u59kBIBTyiC7hPp8dLPYxLP9sJUq
// L4jAi/867nsfDhu+tHWD0bPUYY6flGDtBGcAhFqywbKCaHDYfCPWcMLhvwYD
// Erj34hcP0974IupIh0DjOz5LcLLBrhQyoHM6V9jmcxDUzWSbqnomH4jdAVia
// uky98Rjo+L4kXQ3vhALO6zI+r2tPXJReWW/ZzqQ/WIqwkGth8So0GMdL1Uxh
// zaSVdtlW7AhKewi2LAR+EfvjABEBAAHCwV8EGAEIABMFAl6kh/MJEG5xicDp
// ogPHAhsMAAC18xAAowbDjbsFa3DqZHBg6KQbX9xja5XAjRtB2WE8jOToarKU
// BKfzp2iE068PKvE0+rLhfzNSHOXSPU+QEMLmbNebX65bgZE6Kt/kllMs45iN
// Og6iTO00eCiDabsdWdf8W0f/D6ICXIoj3WBViN8FFdFg6eurYl/8JAHCgsN6
// XaG6ARVUTJUV/wQqRVY03VmClbUD2lZwu0NBRNOJXOWOon+Xkq+2Oh6Qpyg2
// xaWegXrVlww5eOsK7A4tLwXfstMV1SumS3H/XwpZ3OOV1CQ44UZ0O55eXJKI
// O2oip787Jw3d0j5Fv1uSNfAB9uVYT2eY3+fLUb2oHlzgEaqlFYFXiy60UN4m
// W5sPsKYM4Qvp4CxYMEVaVP0kBtPkV2XznfxZoltxQfv5AYGQ5rwSvFulIuqD
// 5+PfR4QE5fgqyWPiGk8TrQzYSYoUO5gE6rNj+/LlM0DR0Q8B0h6q0srkV6vu
// 1t9WV5Idct1fvd2v7T0VRlvf9sBD2Dq8O9g4dsAPcO2Tne/PEH63zp3pXDWd
// DpHwmZ+MWIpAigUO0ikUI2oPjtvenCk9koGpQCO3ZkyCaDXMvmvdQQlCsUpc
// VGx/3qpopUK9Enr/JFTTih9xIbw/ih4okWJpg1rosAOPDBDmkVi68obBi5G+
// JZ5PllWyHl0hlkDzSl7kFNBUK4uF5pGspwa67LQ=
// =MuRD
// -----END PGP PUBLIC KEY BLOCK-----
// `;
// var hkp = new openpgp.HKP('https://keyserver.ubuntu.com/');
// hkp.upload(pubkey).then(function(l) { 
//   console.log("success"); console.log(l)

//   var options = {
//       query: 'mahishmatiradadiya1290347856@kotmail.com'
//   };

//   hkp.lookup(options).then(async function(key) {
//       var pub = await openpgp.key.readArmored(key);
//       console.log(key);
//       console.log(pub);
//   });
// });
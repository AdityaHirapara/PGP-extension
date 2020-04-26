document.getElementById('open').addEventListener('click', () => {
  chrome.tabs.create({url: '/index.html'});
});

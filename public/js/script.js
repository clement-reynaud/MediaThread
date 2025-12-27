const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  // Save preference

  if (document.body.classList.contains('light-mode')) {
	document.getElementById('theme-toggle').innerText = "🌜";
  }
  else {
	document.getElementById('theme-toggle').innerText = "☀️";
  }

  localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');

});

// Load preference on page load
if (localStorage.getItem('theme') === 'dark') {
  document.getElementById('theme-toggle').innerText = "☀️";
}
else {
  document.body.classList.add('light-mode');
  document.getElementById('theme-toggle').innerText = "🌜";
}
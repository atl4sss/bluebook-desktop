/* The secret stays in the fragment, so GET requests and access logs omit it. */
const token = window.location.hash.slice(1);
window.history.replaceState(null, '', '/');
if (/^[A-Za-z0-9_-]{43}$/.test(token)) {
  document.getElementById('token').value = token;
  document.getElementById('download').disabled = false;
  document.getElementById('status').textContent = 'Ready to download.';
}
document.querySelector('form').addEventListener('submit', () => {
  document.getElementById('download').disabled = true;
  document.getElementById('status').textContent = 'Download requested. This link cannot be used again.';
});

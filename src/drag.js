window.onload = addListeners();
var x_pos = 0,
  y_pos = 0;

function addListeners() {
  document.getElementById('topbar').addEventListener('mousedown', mouseDown, false);
  window.addEventListener('mouseup', mouseUp, false);
}

function mouseUp() {
  window.removeEventListener('mousemove', divMove, true);
}

function mouseDown(e) {
  var div = document.getElementById('optionsmenu');
  x_pos = e.clientX - div.offsetLeft;
  y_pos = e.clientY - div.offsetTop;
  window.addEventListener('mousemove', divMove, true);
}

function divMove(e) {
  var div = document.getElementById('optionsmenu');
  div.style.position = 'absolute';
  div.style.top = (e.clientY - y_pos) + 'px';
  div.style.left = (e.clientX - x_pos) + 'px';
}

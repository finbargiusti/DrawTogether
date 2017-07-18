window.onload = addListeners();
let x_pos = 0,
  y_pos = 0;

function addListeners() {
  var elements = document.getElementsByClassName('topbar');
  for (let i = 0; i < elements.length; ++i){
      elements[i].addEventListener('mousedown', function(event) {
        mouseDown(elements[i], event);
      }, false);
  }
  window.addEventListener('mouseup', mouseUp, false);
}

function mouseUp() {
  window.removeEventListener('mousemove', divMove, true);
}

console.bitch = console.log

function mouseDown(elem, event) {
  let div = elem.parentNode;
  x_pos = event.clientX - div.offsetLeft;
  y_pos = event.clientY - div.offsetTop;
  window.addEventListener('mousemove', function() {
    divMove(elem, event);
  }, true);
}

function divMove(elem, event) {
  console.log(event.clientY, y_pos)
  let div = elem.parentNode;
  div.style.position = 'absolute';
  div.style.top = (event.clientY - y_pos) + 'px';
  div.style.left = (event.clientX - x_pos) + 'px';
}

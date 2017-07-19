window.onload = addListeners();
let x_pos = 0,
    y_pos = 0,
    followedElement = null;

function addListeners() {
  var elements = document.getElementsByClassName('topbar');
  for (let i = 0; i < elements.length; ++i){
      elements[i].addEventListener('mousedown', function(event) {
        mouseDown(elements[i], event);
      }, false);
  }
  window.addEventListener('mouseup', mouseUp, true);
    window.addEventListener("mousemove", mouseMove, false);
}

function mouseUp() {
  followedElement = null;
}

function mouseMove(e) {
    if (followedElement !== null) {
        divMove(followedElement, e)
    }
}

function mouseDown(elem, event) {
  let div = elem.parentNode;
  x_pos = event.clientX - div.offsetLeft;
  y_pos = event.clientY - div.offsetTop;
    followedElement = elem;
}

function divMove(elem, event) {
  let div = elem.parentNode;
  div.style.position = 'absolute';
  div.style.top = (event.clientY - y_pos) + 'px';
  div.style.left = (event.clientX - x_pos) + 'px';
}

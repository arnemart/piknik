var convert = require('color-convert');
var copy = require('copy-to-clipboard');

var x = 0, y = 0, z = 50;

var picking = true;

var dark = false;

var current;
var currentHex;

var form = document.querySelector('form');
var input = document.querySelector('input');
var button = document.querySelector('button');
var div = document.querySelector('.xhair');

document.addEventListener('mousemove', function(e) {
  if (picking) {
    x = e.clientX;
    y = e.clientY;
    setColor();
  }
});

document.addEventListener('mousewheel', function(e) {
  e.preventDefault();
  z = Math.max(0, Math.min(100, z + e.deltaY / 10));
  setColor();
});

function setHSL(h, s, l) {
  setColor.apply(null, convert.hsl.rgb(h, s, l));
}

function setColor(r, g, b) {
  var hex;
  if (r) {
    hex = '#' + convert.rgb.hex(r, g, b);
    current = convert.rgb.hsl(r, g, b);
  } else {
    var h = x / window.innerWidth * 360;
    var s = 100 - (y / window.innerHeight * 100);
    var l = z;
    current = [h, s, l];
    hex = '#' + convert.hsl.hex(h, s, l);
  }
  currentHex = hex;
  if (dark && current[2] >= 40) {
    dark = false;
    div.className = 'xhair dark';
  } else if (!dark && current[2] < 40) {
    dark = true;
    div.className = 'xhair light';
  }
  document.body.style.backgroundColor = hex;
  input.value = hex;
}

button.addEventListener('click', function(e) {
  e.preventDefault();
  copy(input.value, {
    debug: true
  });
});

form.addEventListener('submit', function(e) {
  e.preventDefault();
  fromString(input.value);
  lock();
});

input.addEventListener('focus', input.select);
input.addEventListener('click', input.select);

document.addEventListener('click', function(e) {
  if (e.target.tagName == 'HTML' || e.target.tagName == 'BODY') {
    if (picking) {
      lock();
    } else {
      unlock(e);
    }
  }
});

function lock() {
  picking = false;
  document.body.className = "";
  if (current) {
    var x = current[0] / 360 * window.innerWidth;
    var y = (100 - current[1]) / 100 * window.innerHeight;
    div.style.transform = 'translateX(' + x +'px) translateY(' + y + 'px)';
  }
  if (currentHex) {
    window.location.hash = currentHex;
  }
}

function unlock(e) {
  picking = true;
  if (e) {
    x = e.clientX;
    y = e.clientY;
    setColor();
  }
  window.location.hash = '';
  document.body.className = "picking";
}

function fromString(str) {
  var matches = str.match(/^#?(([a-fA-F0-9]{3}){1,2})/);
  if (matches) {
    setColor.apply(null, convert.hex.rgb(matches[1]));
    return true;
  }
  return false;
}

if (fromString(window.location.hash)) {
  lock();
} else {
  document.body.className = "picking";
  setHSL(Math.round(Math.random() * 360), Math.round(Math.random() * 100), 50);
}

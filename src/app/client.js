require('purecss');

var Elm = require('./elm/Main');

Elm.Main.fullscreen({
  server: 'ws://' + window.location.host
});

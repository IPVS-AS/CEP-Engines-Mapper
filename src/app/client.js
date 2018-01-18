require('purecss');
require('./static/style');

var Elm = require('./elm/Main');

Elm.Main.fullscreen({
  server: 'ws://' + window.location.host
});

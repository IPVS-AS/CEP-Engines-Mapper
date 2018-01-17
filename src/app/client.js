'use strict';

require('purecss');

var Elm = require('./elm/Main.elm');
var mount = document.getElementById('main');

var app = Elm.Main.embed(mount, {
  server: 'ws://' + window.location.host
});

if (module.hot) {
  module.hot.accept();
}

'use strict';

require('purecss');

var Elm = require('./Main.elm');
var mount = document.getElementById('main');
var server = document.getElementById('server');

var app = Elm.Main.embed(mount, {
  server: server.dataset.address
});

if (module.hot) {
  module.hot.accept();
}

'use strict';

var Elm = require('./Main.elm');
var mount = document.getElementById('main');

var app = Elm.Main.embed(mount);

if (module.hot) {
  module.hot.accept();
}

"use strict";

function trimLeft(str) {
  return str.replace(/^\s+/, '');
}
var myapp;
(function (myapp) {
  var util;
  (function (util) {
    var strings;
    (function (strings) {
      function trimLeft(str) {
        return str.replace(/^\s+/, '');
      }
      strings.trimLeft = trimLeft;
      function trimRight(str) {
        return str.replace(/\s+$/, '');
      }
      strings.trimRight = trimRight;
    })(strings = util.strings || (util.strings = {}));
  })(util = myapp.util || (myapp.util = {}));
})(myapp || (myapp = {}));
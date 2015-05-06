var patch = require('virtual-dom/patch');
var diff = require('virtual-dom/diff');
var elementStates = require('./elementStates');

module.exports = function (element, vUpdate) {
  patch(element,
    diff(elementStates.get(element), vUpdate)
  );
  elementStates.set(element, vUpdate);
};

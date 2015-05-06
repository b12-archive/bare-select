var createElement = require('virtual-dom/create-element');
var elementStates = require('./elementStates');

var doc = (
  (typeof window !== 'undefined' && window.document) ||
  require('jsdom').jsdom().defaultView.document
);

module.exports = function (vTree) {
  var element = createElement(vTree, {document: doc});
  elementStates.set(element, vTree);
  return element;
};

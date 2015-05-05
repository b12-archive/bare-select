var view = require('./view');

var proto = Object.create(HTMLElement.prototype);
proto.createdCallback = function() {
  this.view = view(this);
};

document.registerElement('bare-select', {prototype: proto});

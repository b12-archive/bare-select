require('es6-set/implement');

var keyCodes = require('../utils/keyCodes');
var includes = require('array-includes');

module.exports = function (args) {
  var view = args.view;
  var model = args.model;

  // Cache available values and keep them up to date.
  var valuesSnapshot = null;
  view.options.when('update', function (options) {
    valuesSnapshot = options.values;
    // TODO: Check if options are OK.
  });

  // Cache the selected option and keep it up to date.
  var selectionSnapshot = null;
  model.state.when('value', function (state) {
    selectionSnapshot = state.attributes.value || null;
    // TODO: Check if state is OK.
  });

  // Handle arrow keys.
  view.switchElement.on('keydown', function(event) {
    // TODO: Support [`event.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
    var keyCode = event.keyCode;

    if (includes([
      keyCodes.DOWN_ARROW,
    ], keyCode)) {
      if (keyCode === keyCodes.DOWN_ARROW) {
        if (!selectionSnapshot) {
          view.selection.emit('update', {newValue: valuesSnapshot[0]});
        }
      }
    }
  });
};

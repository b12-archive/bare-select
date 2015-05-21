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

  function selectByIndex(index) {
    if (valuesSnapshot) {

      // Update the selection snapshot.
      selectionSnapshot = valuesSnapshot[index] || '';
        // TODO: Should this fail silently?

      // Update the view.
      view.selection.emit('update', {newValue: selectionSnapshot});

      // Update the model.
      model.patch.emit('patch', {value: selectionSnapshot});
    }  // TODO: Else fail silently?
  }

  // Handle arrow keys.
  view.switchElement.on('keydown', function(event) {
    // TODO: Support [`event.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
    var keyCode = event.keyCode;

    if (includes([
      keyCodes.DOWN_ARROW,
    ], keyCode)) {
      if (keyCode === keyCodes.DOWN_ARROW) {
        if (!selectionSnapshot) selectByIndex(0);
      }
    }
  });
};

require('es6-set/implement');

var keyCodes = require('../utils/keyCodes');
var includes = require('array-includes');
var between = require('1-liners/between');

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
  var selectionSnapshot = '';
  model.state.when('value', function (state) {
    selectionSnapshot = state.attributes.value || '';
    // TODO: Check if state is OK.
  });

  var unfoldedSnapshot = false;
  model.state.when('unfolded', function (state) {
    unfoldedSnapshot = (state.attributes.unfolded === '');
    // TODO: Check if state is OK.
  });

  function selectByIndex(index) {
    if (valuesSnapshot) {

      // Update the selection snapshot.
      selectionSnapshot = (
        valuesSnapshot[between(0, valuesSnapshot.length - 1, index)] ||
        ''
      );
        // TODO: Should this fail silently?

      // Update the model.
      model.patch.emit('patch', {value: selectionSnapshot});
    }  // TODO: Else fail silently?
  }

  // Handle the `keydown` event.
  view.switchElement.on('keydown', function(event) {
    // TODO: Support [`event.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
    var keyCode = event.keyCode;

    // Handle arrow keys.
    if (includes([
      keyCodes.DOWN_ARROW,
      keyCodes.RIGHT_ARROW,
      keyCodes.UP_ARROW,
      keyCodes.LEFT_ARROW,
      keyCodes.HOME,
      keyCodes.END,
    ], keyCode)) {
      event.preventDefault();

      selectByIndex(
        includes([
          keyCodes.DOWN_ARROW,
          keyCodes.RIGHT_ARROW,
        ], keyCode) ?
        (
          selectionSnapshot ?
          valuesSnapshot.indexOf(selectionSnapshot) + 1 :
          0
        ) :

        includes([
          keyCodes.UP_ARROW,
          keyCodes.LEFT_ARROW,
        ], keyCode) ?
        (
          selectionSnapshot ?
          valuesSnapshot.indexOf(selectionSnapshot) - 1 :
          Infinity
        ) :

        (keyCode === keyCodes.HOME) ?
        0 :

        (keyCode === keyCodes.END) ?
        Infinity :

        0
      );
    }

    // Handle fold/unfold behavior.
    if (
      includes([
        keyCodes.ENTER,
        keyCodes.SPACE,
        keyCodes.ESCAPE,
      ], keyCode) ||
      (
        unfoldedSnapshot === true &&
        keyCode === keyCodes.TAB
      )
    ) {
      event.preventDefault();

      if (unfoldedSnapshot === true && includes([
        keyCodes.ENTER,
        keyCodes.TAB,
        keyCodes.ESCAPE,
      ], keyCode)) {
        unfoldedSnapshot = false;
        model.patch.emit('patch', {unfolded: undefined});
      }

      else if (unfoldedSnapshot === false && includes([
        keyCodes.ENTER,
        keyCodes.SPACE,
      ], keyCode)) {
        unfoldedSnapshot = true;
        model.patch.emit('patch', {unfolded: ''});
      }
    }
  });
};

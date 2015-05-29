var keyCodes = require('../utils/keyCodes');
var includes = require('array-includes');
var between = require('1-liners/between');

var error = require('1-liners/curry')(require('../utils/error'))({
  source: 'keyboardNavigation'
});

module.exports = function (args) {
  var view = args.view;
  var model = args.model;

  // Cache available values and keep them up to date.
  var valuesSnapshot = null;
  view.options.when('update', function (options) {
    var values;
    if (
      !options ||
      !Array.isArray(values = options.values)
    ) return model.patch.emit('error', error(
      'Invalid `update` message from `view.options`. Make sure you pass an ' +
      '`options` object with `{String[]} options.values`.'
    ));

    valuesSnapshot = options.values;
  });

  // Cache the selected option and keep it up to date.
  var selectionSnapshot = '';
  model.state.when('value', function (state) {
    var value;
    if (
      !state ||
      !state.current ||
      typeof (value = state.current.value || '') !== 'string'
    ) return model.patch.emit('error', error(
      'Invalid `value` message from `model.state`. Make sure you pass a ' +
      '`state` object with `{Object} state.current`.'
    ));

    selectionSnapshot = value;
  });

  var unfoldedSnapshot = false;
  model.state.when('unfolded', function (state) {
    if (
      !state ||
      !state.current
    ) return model.patch.emit('error', error(
      'Invalid `unfolded` message from `model.state`. Make sure you pass a ' +
      '`state` object with `{Object} state.current`.'
    ));

    unfoldedSnapshot = (state.current.unfolded === '');
  });

  function selectByIndex(index) {
    if (!valuesSnapshot) return;

    // Update the selection snapshot.
    selectionSnapshot = valuesSnapshot[
      between(0, valuesSnapshot.length - 1, index)
    ];

    // Update the model.
    model.patch.emit('patch', {value: selectionSnapshot});
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

        (keyCode === keyCodes.END) &&
        Infinity
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

  // Prevent default behavior of [SPACE] (flicking the switch).
  view.switchElement.on('keyup', function(event) {
    if (event.keyCode === keyCodes.SPACE) {
      event.preventDefault();
    }
  });
};

require('es6-set/implement');

var findIndex = require('find-index');
var error = require('1-liners/curry')(require('../utils/error'))({
  source: 'value'
});

function getSelectedValue(options) {
  var values = options.values;
  var radioNodes = options.radioNodes;

  if (
    !Array.isArray(values) ||
    !Array.isArray(radioNodes)
  ) return {error: error(
    'Can’t get the selected value. The view hasn’t registered valid ' +
    'options. I’m expecting `{String[]} options.values` and ' +
    '`{HTMLInputElement[]} options.radioNodes`.'
  )};

  return {value: options.values[
    findIndex(options.radioNodes, function(node) {
      return node.checked;
    })
  ]};
}

module.exports = function (args) {
  var view = args.view;
  var model = args.model;
  var logger = args.logger || console;

  var checkedOptionSnapshot;
  function updateCheckedOption(newValue) {
    if (newValue !== checkedOptionSnapshot) {
      model.patch.emit('patch', {value: newValue});
    }
    checkedOptionSnapshot = newValue;
  }

  function updateFromOptions(options) {
    var result = getSelectedValue(options);
    if (result.error) return model.patch.emit('error', result.error);
    updateCheckedOption(result.value);
  }

  // Rescan options and emit a patch if necessary:
  // * when options are added, removed or changed,
  var optionsSnapshot = {};
  view.options.when('update', function(options) {
    updateFromOptions(options);
    optionsSnapshot = options;
  });

  // * upon a `change` event on the container – when something has been
  // selected.
  view.containerElement.on('change', function() {
    updateFromOptions(optionsSnapshot);
  });

  // Update the selected option when the `value` attribute has been updated.
  model.state.when('value', function(update) {
    var emitSelection = view.selection.emit;
    var values = optionsSnapshot.values;

    if (!Array.isArray(values)) return emitSelection('error', error(
      'Can’t update the value. The view hasn’t registered any options.'
    ));

    if (!update.attributes) return emitSelection('error', error(
      'Can’t find `.attributes` in the `value` message from `model.state`.'
    ));

    var newValue = update.attributes.value || null;
    if (
      values.indexOf(newValue) === -1 &&
        // TODO: Write a lightweight shim of `array.includes` for this.
      newValue !== null
    ) return emitSelection('error', error(
      'Value not found. Pass one of these values instead: [' +
      values
        .map(function(value) {return ('"' + value + '"');})
        .join(', ') +
      '].'
    ));

    emitSelection('update', {newValue: newValue});
  });
};

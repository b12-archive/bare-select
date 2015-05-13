require('es6-set/implement');

var findIndex = require('find-index');
var error = require('1-liners/curry')(require('../utils/error'))({
  source: 'value'
});

function getSelectedValue(options) {
  return options.values[
    findIndex(options.radioNodes, function(node) {
      return node.checked;
    })
  ];
}

module.exports = function (args) {
  var view = args.view;
  var model = args.model;
  var logger = args.logger || console;

  var checkedOptionSnapshot;
  function updateCheckedOption(newValue) {
    if (newValue !== checkedOptionSnapshot) {
      model.patches.emit('apply', {value: newValue});
    }

    checkedOptionSnapshot = newValue;
  }

  function updateFromOptions(options) {
    return updateCheckedOption(getSelectedValue(options));
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
  model.updates.when('value', function(state) {
    var emitSelection = view.selection.emit;
    var values = optionsSnapshot.values;

    if (!Array.isArray(values)) return logger.warn(error(
      'Can’t update the value. The view hasn’t registered any options.'
    ).message);

    var newValue = state.attributes.value || null;
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

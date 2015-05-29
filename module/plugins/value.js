var findIndex = require('find-index');
var error = require('1-liners/curry')(require('../utils/error'))({
  source: 'value'
});

// TODO: Move to own file.
function getSelectedValue(options) {
  var values;
  var radioNodes;

  if (
    !options ||
    !Array.isArray(values = options.values) ||
    !Array.isArray(radioNodes = options.radioNodes)
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

 /**
  * Adds support for the attribute `value`. Changing the selection will update
  * the attribute `value` within the `<bare-select>`. Changing the attribute
  * will update the selection.
  *
  * @param  {Object}       args
  * @param  {Object}       args.view
  * @param  {ø output}     args.view.options
  * @param  {ø input}      args.view.update
  * @param  {Object}       args.model
  * @param  {ø output}     args.model.state
  *
  * @protected
  * @function
  * @module     bare-select/module/plugins/keyboardNavigation
  */
module.exports = function (args) {
  var view = args.view;
  var model = args.model;

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
    updateCheckedOption(result.value || '');
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
  view.dropdownElement.on('change', function() {
    updateFromOptions(optionsSnapshot);
  });

  // Update the selected option when the `value` attribute has been updated.
  model.state.when('value', function(state) {
    var emitUpdate = view.update.emit;
    var values = optionsSnapshot.values;

    if (!Array.isArray(values)) return emitUpdate('error', error(
      'Can’t update the value. The view hasn’t registered any options.'
    ));

    if (!state || !state.current) return emitUpdate('error', error(
      'Invalid `value` message from `model.state`. Make sure you pass an ' +
      'object with `{Object} value.current`.'
    ));

    var newValue = state.current.value || '';
    if (
      newValue !== '' &&
      values.indexOf(newValue) === -1
        // TODO: Write a lightweight shim of `array.includes` for this.
    ) return emitUpdate('error', error(
      'Value not found. Pass one of these values instead: [' +
      values
        .map(function(value) {return ('"' + value + '"');})
        .join(', ') +
      '], or an empty string to reset all options.'
    ));

    emitUpdate('selection', {newValue: newValue});
  });
};

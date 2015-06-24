var error = require('./value/error');
var getSelectedValue = require('./value/getSelectedValue');

 /**
  * Adds support for the attribute `value`. Changing the selection will update
  * the attribute `value` within the `<bare-select>`. Changing the attribute
  * will update the selection.
  *
  * @module     {Function}  bare-select/module/plugins/value
  * @protected
  *
  * @returns  {pluginMaker}
  */
module.exports = function() {return function (args) {
  var view = args.view;
  var model = args.model;

  var checkedOptionSnapshot = {};  // Not equal to anything else.
  function updateCheckedOption(newValue) {
    if (newValue !== checkedOptionSnapshot) {
      model.patch.emit('patch', {value: newValue});
    }
    checkedOptionSnapshot = newValue;
  }

  function updateFromOptions(options) {
    var result = getSelectedValue(options);
    if (result.error) return model.patch.emit('error', result.error);
    updateCheckedOption(result.value || undefined);
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

    var newValue = state.current.value || null;
    if (
      newValue != null &&
      values.indexOf(newValue) === -1
        // SOON [#6901]: Write a lightweight shim of `array.includes` for this.
    ) return emitUpdate('error', error(
      'Value not found. Pass one of these values instead: [' +
      values
        .map(function(value) {return ('"' + value + '"');})
        .join(', ') +
      '], or an empty string to reset all options.'
    ));

    emitUpdate('selection', {newValue: newValue});
  });
};};

var find = require('array-find');

function getSelectedValue(options) {
  return find(Object.keys(options), function(value) {
    return options[value].radioNode.checked;
  });
}

module.exports = function (args) {
  var view = args.view;
  var model = args.model;
  // TODO: Support `args.logger`.

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
  model.updates.when('value', function(data) {

    // Fail silently:
    // * if there are no options loaded,
    if (!optionsSnapshot) return;

    // * if there is no option provided for the value.
    var option = optionsSnapshot[data.attributes.value];
    if (!option) return;

    // Else check the respective option.
    option.radioNode.checked = true;
  });
};

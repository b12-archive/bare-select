require('es6-set/implement');

var findIndex = require('find-index');

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
  model.updates.when('value', function(state) {
    // TODO: Can we assume that event messages are safe?
    view.selection.emit('update', {
      newValue: (state.attributes.value || null)
    });
  });
};

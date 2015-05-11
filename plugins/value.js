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
  model.updates.when('value', function(data) {
    // TODO: Can we assume that event messages are safe?

    // Fail silently:
    // * if there are no options loaded yet.
    if (!optionsSnapshot.radioNodes || !optionsSnapshot.values) return;

    // * if there is no option provided for the value.
    var option = optionsSnapshot.radioNodes[
      optionsSnapshot.values.indexOf(data.attributes.value)
    ];
    if (!option) return;
      // TODO: Should we really fail silently?

    // Else check the respective option.
    option.checked = true;
  });
};

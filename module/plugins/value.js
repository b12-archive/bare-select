var find = require('array-find');

function getSelectedValue(options) {
  return find(Object.keys(options), function(value) {
    return options[value].children[0].checked;
  });
}

module.exports = function (view, model) {
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

  var optionsSnapshot = {};
  view.options.when('update', function(options) {
    updateFromOptions(options);
    optionsSnapshot = options;
  });

  view.containerElement.on('change', function() {
    updateFromOptions(optionsSnapshot);
  });
};

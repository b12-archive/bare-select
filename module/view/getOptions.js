var arrayFrom = require('array-from');

var error = require('./error');

module.exports = function(args) {
  var getElement = args.getElement;
  var selectors = args.selectors;

  // Get and validate the options.
  var optionsResult = getElement({
    selector: selectors.option,
    multiple: true,
    elementName: 'option',
  });

  if (optionsResult.error) return optionsResult;
  var options = arrayFrom(optionsResult.value);

  // Check and parse each option in one loop.
  var values = [];
  var radioNodes = [];
  var labelNodes = [];

  var atLeastOneOptionValid = false;

  options.forEach(function(option) {
    var radio = option.querySelector(selectors.optionRadio);
    var label = option.querySelector(selectors.optionLabel);
    if (!radio || !label) return;

    atLeastOneOptionValid = true;
    values.push(radio.value);
    radioNodes.push(radio);
    labelNodes.push(label);
  });

  if (!atLeastOneOptionValid) return {error: error(
    'Wrong markup within options. Make at least one of the options (`' +
    selectors.option +
    '`) has a radio button matching the selector `' +
    selectors.optionRadio +
    '` and a label matching `' +
    selectors.optionLabel +
    '`. Make sure the radio button has a `value` property.'
  )};

  // Return the value.
  return {value: {
    values: values,
    radioNodes: radioNodes,
    labelNodes: labelNodes,
  }};
};

var test = require('../test-tools/test')('“value” plugin');
var ø = require('stereo');
var createElement = require('../test-tools/createElement');
var updateElement = require('../test-tools/updateElement');
var h = require('virtual-dom/h');
var repeat = require('repeat-element');

var value = require('../../module/plugins/value');

function optionElement(args) {
  return (
    h('li', [
      h('input', {
        type: 'radio',
        value: args.value,
        checked: args.checked,
      })
    ])
  );
}
var mockOptions = repeat(null, 5).map(function(_, index) {
  return createElement(optionElement({
    value: String(index),
    checked: (index === 0),
  }));
});

var mockView = {
  options: ø(),
  containerElement: ø(),
};
mockView.options.emit('update', mockOptions);

var mockModel = {
  patches: ø(),
};

// Initialize the plugin.
value(mockView, mockModel);

test(
  'Patches the attribute `value` when an option is selected.',
  function(is) {
    is.plan(2);

    var patchRun = 1;
    mockModel.patches.when('apply', function(patch) {
      if (patchRun === 1) is.equal(
        patch.value,
        '0',
        'issues an `apply` event with the initial value to `model.patch`'
      );

      if (patchRun === 2) is.equal(
        patch.value,
        '2',
        'issues an `apply` event to `model.patch` when the value changes'
      );

      if (patchRun > 2) is.fail(
        'too many `apply` events issued'
      );

      patchRun++;
    });

    // Update the second option and emit a `change` to `containerElement`.
    updateElement(mockOptions[0], optionElement({
      value: '0',
      checked: false,
    }));
    updateElement(mockOptions[2], optionElement({
      value: '2',
      checked: true,
    }));
    mockView.containerElement.emit('change');

    // Issue an update without changing anything.
    mockView.containerElement.emit('change');

    is.end();
  }
);

// TODO: Test plugin unregistering

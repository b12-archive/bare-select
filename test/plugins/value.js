var test = require('../test-tools/test')('“value” plugin');
var ø = require('stereo');
var createElement = require('../test-tools/createElement');
var updateElement = require('../test-tools/updateElement');
var h = require('virtual-dom/h');
var repeat = require('repeat-element');

var value = require('../../plugins/value');

function optionRadio(args) {
  return (
    h('input', {
      type: 'radio',
      value: args.value,
      checked: args.checked,
    })
  );
}
var mockOptions = repeat(null, 5).map(function(_, index) {
  return {radioNode: createElement(optionRadio({
    value: String(index),
    checked: (index === 0),
  }))};
});

var mockView = {
  options: ø(),
  containerElement: ø(),
};
mockView.options.emit('update', mockOptions);

var mockModel = {
  patches: ø(),
  updates: ø(),
};

// Initialize the plugin.
value({
  view: mockView,
  model: mockModel,
});

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
    updateElement(mockOptions[0].radioNode, optionRadio({
      value: '0',
      checked: false,
    }));
    updateElement(mockOptions[2].radioNode, optionRadio({
      value: '2',
      checked: true,
    }));
    mockView.containerElement.emit('change');

    // Issue an update without changing anything.
    mockView.containerElement.emit('change');

    is.end();
  }
);

test(
  'Updates the selected option when the attribute `value` has changed.',
  function(is) {
    mockModel.updates.emit('value', {
      value: '4'
    });
    is.ok(
      mockOptions[4].radioNode.checked,
      'does it synchronously when everything goes smooth'
    );

    mockModel.updates.emit('value', {
      value: 'something invalid'
    });
    is.ok(
      mockOptions[4].radioNode.checked,
      'fails silently when the option’s value can’t be found'
    );
    // TODO: Should this issue an `error` event? To which channel?

    is.end();
  }
);

// TODO: Test plugin unregistering

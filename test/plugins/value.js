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
function mockOptions() {
  var stamp = repeat(null, 5);
  return {
    values: stamp.map(function (_, index) {return String(index);}),
    radioNodes: stamp.map(function (_, index) {
      return createElement(optionRadio({
        value: String(index),
        checked: (index === 0),
      }));
    }),
  };
}

function mockView() { return {
  options: ø(),
  containerElement: ø(),
}; }

function mockModel() { return {
  patches: ø(),
  updates: ø(),
}; }

test(
  'Patches the attribute `value` when an option is selected.',
  function(is) {
    is.plan(2);

    // Initialize the plugin.
    var view = mockView();
    var model = mockModel();
    var options = mockOptions();
    value({
      view: view,
      model: model,
    });
    view.options.emit('update', options);

    // Set up tests.
    var patchRun = 1;
    model.patches.when('apply', function(patch) {
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

    // Update the second option and emit a mock `change` to `containerElement`.
    updateElement(options.radioNodes[0], optionRadio({
      value: '0',
      checked: false,
    }));
    updateElement(options.radioNodes[2], optionRadio({
      value: '2',
      checked: true,
    }));
    view.containerElement.emit('change');

    // Emit a `change` without updating anything.
    view.containerElement.emit('change');

    is.end();
  }
);

test(
  'Updates the selected option when the attribute `value` has changed.',
  function(is) {

    // Initialize the plugin.
    var view = mockView();
    var model = mockModel();
    var options = mockOptions();
    value({
      view: view,
      model: model,
    });

    model.updates.emit('value', {attributes: {
      value: '3'
    }});
    is.notOk(
      options.radioNodes[3].checked,
      'fails silently if no options have been registered'
    );

    view.options.emit('update', options);

    model.updates.emit('value', {attributes: {
      value: '4'
    }});
    is.ok(
      options.radioNodes[4].checked,
      'does it synchronously when everything goes smooth'
    );

    model.updates.emit('value', {attributes: {
      value: 'something invalid'
    }});
    is.ok(
      options.radioNodes[4].checked,
      'fails silently when the option’s value can’t be found'
    );
    // TODO: Should this issue an `error` event? To which channel?

    is.end();
  }
);

// TODO: Test plugin unregistering

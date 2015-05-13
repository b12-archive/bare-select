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
  selection: ø(),
  containerElement: ø(),
}; }

function mockModel() { return {
  patch: ø(),
  state: ø(),
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
    model.patch.when('patch', function(patch) {
      if (patchRun === 1) is.equal(
        patch.value,
        '0',
        'issues a `patch` event with the initial value to `model.patch`'
      );

      if (patchRun === 2) is.equal(
        patch.value,
        '2',
        'issues a `patch` event to `model.patch` when the value changes'
      );

      if (patchRun > 2) is.fail(
        'too many `patch` events issued'
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
  'Updates `view.selection` when the attribute `value` has changed.',
  function(is) {
    is.plan(3);

    // Initialize the plugin.
    var view = mockView();
    var model = mockModel();
    value({
      view: view,
      model: model,
    });

    // Emit an update before registering options.
    view.selection.once('error', function(error) {is.ok(
      error.message.match(/can’t update the value/i),
      'logs a warning if no options have been registered.'
    );});
    model.state.emit('value', {attributes: {
      value: 'the value'
    }});

    // Register options.
    view.options.emit('update', {
      values: ['the value'],
      radioNodes: [{}]
    });

    // Emit a valid option.
    view.selection.once('update', function(update) {is.equal(
      update.newValue,
      'the value',
      'emits an `update` synchronously when the passed value is valid'
    );});
    model.state.emit('value', {attributes: {
      value: 'the value'
    }});

    // Emit an invalid option.
    view.selection.once('error', function(error) {is.ok(
      error.message.match(/value not found/i),
      'emits an `error` synchronously when the passed value is invalid'
    );});
    model.state.emit('value', {attributes: {
      value: 'something invalid'
    }});

    is.end();
  }
);

// TODO: Test plugin unregistering

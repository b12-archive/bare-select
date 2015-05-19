var test = require('../test-tools/test')('“value” plugin');
var updateElement = require('../test-tools/updateElement');
var mockPlugin = require('../test-tools/mockPlugin');
var mockOptionRadio = require('../test-tools/mockOptionRadio');
var mockOptions = require('../test-tools/mockOptions');

var value = require('../../plugins/value');

test(
  'Patches the attribute `value` when an option is selected.',
  function(is) {
    is.plan(2);

    // Initialize the plugin.
    var mock = mockPlugin(value);
    var options = mockOptions();
    mock.view.options.emit('update', options);

    // Set up tests.
    var patchRun = 1;
    mock.model.patch.when('patch', function(patch) {
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
    updateElement(options.radioNodes[0], mockOptionRadio({
      value: '0',
      checked: false,
    }));
    updateElement(options.radioNodes[2], mockOptionRadio({
      value: '2',
      checked: true,
    }));
    mock.view.containerElement.emit('change');

    // Emit a `change` without updating anything.
    mock.view.containerElement.emit('change');

    is.end();
  }
);

test(
  'Updates `view.selection` when the attribute `value` has changed.',
  function(is) {
    is.plan(3);

    // Initialize the plugin.
    var mock = mockPlugin(value);

    // Emit an update before registering options.
    mock.view.selection.once('error', function(error) {is.ok(
      error.message.match(/can’t update the value/i),
      'logs a warning if no options have been registered.'
    );});
    mock.model.state.emit('value', {attributes: {
      value: 'the value'
    }});

    // Register options.
    mock.view.options.emit('update', {
      values: ['the value'],
      radioNodes: [{}]
    });

    // Emit a valid option.
    mock.view.selection.once('update', function(update) {is.equal(
      update.newValue,
      'the value',
      'emits an `update` synchronously when the passed value is valid'
    );});
    mock.model.state.emit('value', {attributes: {
      value: 'the value'
    }});

    // Emit an invalid option.
    mock.view.selection.once('error', function(error) {is.ok(
      error.message.match(/value not found/i),
      'emits an `error` synchronously when the passed value is invalid'
    );});
    mock.model.state.emit('value', {attributes: {
      value: 'something invalid'
    }});

    is.end();
  }
);

test(
  'Fails gracefully.',
  function(is) {
    is.plan(4);

    var mock1 = mockPlugin(value);

    var testRun = 1;
    function test1(error) {
      is.ok(
        testRun++ <= 2 &&
        error.message.match(/can’t get the selected value/i),
        'emits an error if the passed `view.options` are invalid'
      );
    }

    mock1.model.patch.on('error', test1);
    mock1.view.options.emit('update', null);
    mock1.view.options.emit('update', {});
    mock1.model.patch.off('error', test1);

    var mock2 = mockPlugin(value);
    var options = mockOptions();
    mock2.view.options.emit('update', options);

    testRun = 1;
    function test2(error) {
      is.ok(
        testRun++ <= 2 &&
        error.message.match(/invalid `value` message/i),
        'emits an error when it receives an invalid message'
      );
    }

    mock2.view.selection.on('error', test2);
    mock2.model.state.emit('value', null);
    mock2.model.state.emit('value', {});
    mock2.view.selection.off('error', test2);

    is.end();
  }
);

// TODO: Test plugin unregistering

var test = require('../test-tools/test')('“value” plugin');
var updateElement = require('../test-tools/updateElement');
var mockPlugin = require('../test-tools/mockPlugin');
var mockOptionRadio = require('../test-tools/mockOptionRadio');
var mockOptions = require('../test-tools/mockOptions');

var value = require('../../module/plugins/value');

test(
  'Patches the attribute `value` when an option is selected.',
  function(is) {
    is.plan(4);

    // Initialize the plugin.
    var mock = mockPlugin(value);
    var options = mockOptions();

    mock.model.patch.on('patch', function(patch) {is.deepEqual(patch,
      {value: '0'},
      'issues a `patch` event with the initial value to `model.patch`'
    );});
    mock.view.options.emit('update', options);
    mock.model.patch.off('patch');

    // Update the second option and emit a mock `change` to `dropdownElement`.
    updateElement(options.radioNodes[0], mockOptionRadio({
      value: '0',
      checked: false,
    }));

    updateElement(options.radioNodes[2], mockOptionRadio({
      value: '2',
      checked: true,
    }));

    mock.model.patch.on('patch', function(patch) {is.deepEqual(patch,
      {value: '2'},
      'issues a `patch` event to `model.patch` when the value changes'
    );});
    mock.view.dropdownElement.emit('change');
    mock.model.patch.off('patch');

    // Emit a `change` without updating anything.
    mock.model.patch.on('patch', function() {is.fail(
      'doesn’t emit a `patch` event when nothing changes'
    );});
    mock.view.dropdownElement.emit('change');
    mock.model.patch.off('patch');

    // Deselect the option
    updateElement(options.radioNodes[2], mockOptionRadio({
      value: '2',
      checked: false,
    }));

    mock.model.patch.on('patch', function(patch) {is.deepEqual(patch,
      {value: ''},
      'removes the `value` attribute when all options are deselected'
    );});
    mock.view.dropdownElement.emit('change');
    mock.model.patch.off('patch');

    // Initialize a plugin with no selected options.
    var anotherMock = mockPlugin(value);
    anotherMock.model.patch.on('patch', function(patch) {is.deepEqual(patch,
      {value: ''},
      'removes the `value` attribute when a dropdown is initialized ' +
      'without any selected options'
    );});
    anotherMock.view.options.emit('update', mockOptions({
      selectedIndex: null,
    }));
    anotherMock.model.patch.off('patch');

    is.end();
  }
);

test(
  'Emits a `selection` on `view.update` when the attribute `value` has ' +
  'changed.',
  function(is) {
    is.plan(4);

    // Initialize the plugin.
    var mock = mockPlugin(value);

    // Emit an update before registering options.
    mock.view.update.on('error', function(error) {is.ok(
      error.message.match(/can’t update the value/i),
      'emits an `error` if no options have been registered.'
    );});
    mock.model.state.emit('value', {current: {
      value: 'the value'
    }});
    mock.view.update.off('error');

    // Register options.
    mock.view.options.emit('update', {
      values: ['the value'],
      radioNodes: [{}]
    });

    // Emit a valid option.
    mock.view.update.on('selection', function(selection) {is.equal(
      selection.newValue,
      'the value',
      'emits a `selection` synchronously when the passed value is valid'
    );});
    mock.model.state.emit('value', {current: {
      value: 'the value'
    }});
    mock.view.update.off('selection');

    // Emit an empty option.
    mock.view.update.on('selection', function(selection) {is.equal(
      selection.newValue,
      '',
      'emits a `selection` synchronously when the passed value is empty'
    );});
    mock.model.state.emit('value', {current: {
      value: ''
    }});
    mock.view.update.off('selection');

    // Emit an invalid option.
    mock.view.update.on('error', function(error) {is.ok(
      error.message.match(/value not found/i),
      'emits an `error` synchronously when the passed value is invalid'
    );});
    mock.model.state.emit('value', {current: {
      value: 'something invalid'
    }});
    mock.view.update.off('error');

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

    mock2.view.update.on('error', test2);
    mock2.model.state.emit('value', null);
    mock2.model.state.emit('value', {});
    mock2.view.update.off('error', test2);

    is.end();
  }
);

// TODO: Test plugin unregistering

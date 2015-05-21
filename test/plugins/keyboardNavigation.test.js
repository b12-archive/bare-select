var test = require('../test-tools/test')('“keyboardNavigation” plugin');
var keyCodes = require('../../utils/keyCodes');
var mockPlugin = require('../test-tools/mockPlugin');
var mockKeyboardEvent = require('../test-tools/mockKeyboardEvent');

var keyboardNavigation = require('../../plugins/keyboardNavigation');

test(
  'Changes the selected option',
  function(is) {
    is.plan(7);

    var mock = mockPlugin(keyboardNavigation);

    // Prepare select state.
    mock.view.options.emit('update', {
      values: ['1', '2', '3'],
    });
    mock.model.state.emit('value', {attributes: {}});
    mock.view.switchElement.emit('focus');

    // Press ↓.
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '1',
      'selects the first option upon pressing ↓ if nothing has been ' +
      'selected before'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.DOWN_ARROW,
      {preventDefault: function() {is.pass(
        'calls the `event.preventDefault` method'
      );}}
    ));
    mock.model.patch.off('patch');

    // Press →.
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '2',
      'selects the next option upon pressing →'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.RIGHT_ARROW
    ));
    mock.model.patch.off('patch');

    // Press ↑.
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '1',
      'selects the previous option upon pressing ↑'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.UP_ARROW
    ));
    mock.model.patch.off('patch');

    // Press ←.
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '1',
      'doesn’t change anything upon pressing ← when the first option is ' +
      'already selected'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.LEFT_ARROW
    ));
    mock.model.patch.off('patch');

    // Press [END].
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '3',
      'selects the last option upon pressing [END].'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.END
    ));
    mock.model.patch.off('patch');

    // Press [HOME].
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '1',
      'selects the first option upon pressing [HOME].'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.HOME
    ));
    mock.model.patch.off('patch');

    // Finnito.
    is.end();
  }
);

test.skip(  // TODO
  'Slides the dropdown out and back in'
);

test.skip(  // TODO
  'Works only when the select is in focus'
);

test.skip(  // TODO
  'Fails gracefully'
);

var test = require('../test-tools/test')('“keyboardNavigation” plugin');
var keyCodes = require('../../utils/keyCodes');
var mockPlugin = require('../test-tools/mockPlugin');
var mockKeyboardEvent = require('../test-tools/mockKeyboardEvent');

var keyboardNavigation = require('../../plugins/keyboardNavigation');

test(
  'Changes the selected option',
  function(is) {
    is.plan(9);

    // Prepare select state.
    var mock = mockPlugin(keyboardNavigation);
    mock.view.options.emit('update', {
      values: ['1', '2', '3'],
    });

    mock.model.state.emit('value', {attributes: {}});

    // Press [↓].
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '1',
      'selects the first option upon pressing [↓] if nothing has been ' +
      'selected before'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.DOWN_ARROW,
      {preventDefault: function() {is.pass(
        'calls the `event.preventDefault` method'
      );}}
    ));

    mock.model.patch.off('patch');

    // Press [→].
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '2',
      'selects the next option upon pressing [→]'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.RIGHT_ARROW
    ));

    mock.model.patch.off('patch');

    // Press [↑].
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '1',
      'selects the previous option upon pressing [↑]'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.UP_ARROW
    ));

    mock.model.patch.off('patch');

    // Press [←].
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '1',
      'doesn’t change anything upon pressing [←] when the first option is ' +
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

    // Prepare preselected select state.
    var preselectedMock = mockPlugin(keyboardNavigation);
    preselectedMock.view.options.emit('update', {
      values: ['1', '2', '3', '4'],
    });

    preselectedMock.model.state.emit('value', {attributes: {value: '2'}});

    // Press [↓].
    preselectedMock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '3',
      'selects the next option upon pressing [↓] if there is an initial ' +
      'selection'
    );});

    preselectedMock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.DOWN_ARROW
    ));

    preselectedMock.model.patch.off('patch');

    // Prepare another bare select.
    var anotherMock = mockPlugin(keyboardNavigation);
    anotherMock.view.options.emit('update', {values: ['1', '2', '3']});

    // Press [↑].
    anotherMock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '3',
      'selects the last option upon pressing [↑] if nothing is selected'
    );});

    anotherMock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.UP_ARROW
    ));

    anotherMock.model.patch.off('patch');

    // Finnito.
    is.end();
  }
);

test(
  'Unfolds the dropdown and folds it back up',
  function(is) {
    is.plan(8);

    // Prepare a mock select, folded initially.
    var mock = mockPlugin(keyboardNavigation);
    mock.model.state.emit('unfolded', {attributes: {}});

    // Press [SPACE].
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.unfolded,
      '',
      'unfolds the dropdown with [SPACE]'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.SPACE,
      {preventDefault: function() {is.pass(
        'calls the `event.preventDefault` method'
      );}}
    ));

    mock.model.patch.off('patch');

    // Press [SPACE] again.
    mock.model.patch.on('patch', function() {is.fail(
      'doesn’t fold the dropdown back up with [SPACE]'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(keyCodes.SPACE));
    mock.model.patch.off('patch');

    // Unpress [SPACE].
    mock.view.switchElement.emit('keyup', {
      keyCode: keyCodes.SPACE,
      preventDefault: function() {is.pass(
        'prevents the default behavior of [SPACE]'
      );},
    });

    // Press [TAB].
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.unfolded,
      undefined,
      'folds the dropdown back up with [TAB]'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.TAB,
      {preventDefault: function() {is.pass(
        'calls the method `event.preventDefault` when [TAB] is pressed upon ' +
        'an unfolded dropdown'
      );}}
    ));

    mock.model.patch.off('patch');

    // Press [TAB] again.
    mock.model.patch.on('patch', function() {is.fail(
      'doesn’t unfold the dropdown with [TAB]'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.TAB,
      {preventDefault: function() {is.fail(
        'doesn’t call the method `event.preventDefault` when [TAB] is ' +
        'pressed upon a folded dropdown'
      );}}
    ));

    mock.model.patch.off('patch');

    // Press [ENTER].
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.unfolded,
      '',
      'unfolds the dropdown with [ENTER]'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(keyCodes.ENTER));
    mock.model.patch.off('patch');

    // Press [ENTER] again.
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.unfolded,
      undefined,
      'folds the dropdown back up with [ENTER]'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(keyCodes.ENTER));
    mock.model.patch.off('patch');

    // Prepare a mock select, initially unfolded.
    var unfoldedMock = mockPlugin(keyboardNavigation);
    unfoldedMock.model.state.emit('unfolded', {attributes: {unfolded: ''}});

    // Press [ESCAPE].
    unfoldedMock.model.patch.on('patch', function(patch) {is.equal(
      patch.unfolded,
      undefined,
      'folds the dropdown up with [ESCAPE]'
    );});

    unfoldedMock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.ESCAPE
    ));

    unfoldedMock.model.patch.off('patch');

    // Press [ESCAPE] again.
    unfoldedMock.model.patch.on('patch', function() {is.fail(
      'doesn’t unfold the dropdown with [ESCAPE]'
    );});

    unfoldedMock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.ESCAPE
    ));

    unfoldedMock.model.patch.off('patch');

    is.end();
  }
);

test(
  'Reacts to changes from the external world',
  function(is) {
    is.plan(4);

    // Prepare a mock select, without any attributes.
    var mock = mockPlugin(keyboardNavigation);
    mock.view.options.emit('update', {values: ['1', '2', '3', '4']});

    // Press [↓].
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '1',
      'selects the first option upon pressing [↓] if we have no idea what’s ' +
      'selected'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.DOWN_ARROW
    ));

    mock.model.patch.off('patch');

    // Update externally and press [↓] again.
    mock.model.state.emit('value', {attributes: {value: '3'}});
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.value,
      '4',
      'selects the right option after the selection has been changed ' +
      'externally'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(
      keyCodes.DOWN_ARROW
    ));

    mock.model.patch.off('patch');

    // Press [ENTER].
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.unfolded,
      '',
      'unfolds the dropdown with [ENTER] if we don’t know what state it’s in'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(keyCodes.ENTER));
    mock.model.patch.off('patch');

    // Update externally and press [ENTER] again.
    mock.model.state.emit('unfolded', {attributes: {}});
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.unfolded,
      '',
      'unfolds the dropdown again with [ENTER] after it has been externally ' +
      'folded back in'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(keyCodes.ENTER));
    mock.model.patch.off('patch');

    is.end();
  }
);

test(
  'Fails gracefully',
  function(is) {
    is.plan(3);

    // Prepare a mock select, without any attributes.
    var mock = mockPlugin(keyboardNavigation);

    // Press [END] before any options have been loaded.
    mock.model.patch.on('patch', function() {is.fail(
      'fails silently if no options are loaded'
    );});

    mock.view.switchElement.emit('keydown', mockKeyboardEvent(keyCodes.END));
    mock.model.patch.off('patch');

    // Try passing invalid options.
    mock.model.patch.catch(function(error) {is.ok(
      error.message.match(/invalid `update` message/i),
      'detects an invalid `update` from `view.options`'
    );});

    mock.view.options.emit('update', /invalid/);
    mock.model.patch.off('error');

    // Pass proper options.
    mock.view.options.emit('update', {values: ['1', '2', '3', '4']});

    // Try passing an invalid `value`.
    mock.model.patch.catch(function(error) {is.ok(
      error.message.match(/invalid `value` message/i),
      'detects an invalid `value` from `model.state`'
    );});

    mock.model.state.emit('value', /invalid/);
    mock.model.patch.off('error');

    // Try passing an invalid `unfolded` message.
    mock.model.patch.catch(function(error) {is.ok(
      error.message.match(/invalid `unfolded` message/i),
      'detects an invalid `unfolded` from `model.state`'
    );});

    mock.model.state.emit('unfolded', /invalid/);
    mock.model.patch.off('error');

    is.end();
  }
);

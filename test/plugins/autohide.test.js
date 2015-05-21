var test = require('../test-tools/test')('“autohide” plugin');
var mockPlugin = require('../test-tools/mockPlugin');
var noop = require('1-liners/noop');

var autohide = require('../../plugins/autohide');

test(
  'Hides the dropdown',
  function(is) {
    is.plan(1);

    // Prepare an unfolded select.
    var mock = mockPlugin(autohide);
    mock.model.state.emit('unfolded', {attributes: {unfolded: ''}});

    // Blur the select.
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.unfolded,
      undefined,
      'when the select loses focus'
    );});

    mock.view.switchElement.emit('blur');
    mock.model.patch.off('patch');

    // Finnito.
    is.end();
  }
);

test(
  'Prevents the select from losing focus unintentionally',
  function(is) {
    is.plan(1);

    // Prepare an unfolded select.
    var mock = mockPlugin(autohide);

    // Trigger a `change`.
    mock.view.switchElement.focus = function() {is.pass(
      'when the selection is changed'
    );};

    mock.view.containerElement.emit('change');
    mock.view.switchElement.focus = noop;

    // Finnito.
    is.end();
  }
);

test.skip(  // TODO
  'Fails gracefully',
  function(is) {
    is.plan(0);
    is.end();
  }
);

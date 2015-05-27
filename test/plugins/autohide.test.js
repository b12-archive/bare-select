var test = require('../test-tools/test')('“autohide” plugin');
var mockPlugin = require('../test-tools/mockPlugin');

var autohide = require('../../plugins/autohide');

test(
  'Hides the dropdown.',
  function(is) {
    is.plan(2);

    // Prepare a mock select.
    var mock = mockPlugin(autohide);

    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.unfolded,
      undefined,
      'when the select loses focus'
    );});

    // Blur the select.
    mock.view.switchElement.emit('blur');

    // Blur it again by flicking the switch.
    setTimeout(function () {
      mock.model.patch.off('patch');

      mock.view.switchElement.emit('mousedown');
      mock.view.switchElement.emit('blur');

      setTimeout(function () {
        mock.view.switchElement.emit('change', {
          preventDefault: function() {is.pass(
            'keeps it hidden when the loss of focus came from flicking the ' +
            'switch'
          );}
        });

        mock.view.switchElement.emit('change', {
          preventDefault: function() {is.fail(
            'doesn’t break the switch'
          );}
        });
      }, 100);
    }, 100);

    // Blur it again by clicking the switch, but moving the pointer away in
    // the meantime.
    setTimeout(function () {
      mock.view.switchElement.emit('mousedown');
      mock.view.switchElement.emit('blur');

      setTimeout(function () {
        mock.view.switchElement.emit('mouseleave');
        mock.view.switchElement.emit('change', {
          preventDefault: function() {is.fail(
            'detects when the switch has been mousedowned but not changed'
          );}
        });
      }, 100);
    }, 300);

    // Prepare another mock select.
    var anotherMock = mockPlugin(autohide);

    anotherMock.model.patch.on('patch', function() {is.fail(
      'not when the blur was triggered by a click within the dropdown'
    );});

    // Blur the select by clicking in the dropdown.
    anotherMock.view.switchElement.emit('blur');
    anotherMock.view.dropdownElement.emit('mousedown');

    is.timeoutAfter(2000);
  }
);

test(
  'Prevents the select from losing focus unintentionally.',
  function(is) {
    is.plan(1);

    // Prepare an unfolded select.
    var mock = mockPlugin(autohide);

    mock.view.update.on('focused', function(focused) {is.equal(
      focused.newValue,
      true,
      'when the blur was caused by a click inside the dropdown'
    );});

    // Trigger a `click` within the dropdown.
    mock.view.dropdownElement.emit('click');

    is.timeoutAfter(200);
  }
);

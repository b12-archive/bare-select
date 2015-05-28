var test = require('../test-tools/test')('“autohide” plugin');
var mockPlugin = require('../test-tools/mockPlugin');

var autohide = require('../../plugins/autohide');

test(
  'Hides the dropdown.',
  function(is) {
    is.plan(3);

    // Prepare a mock select.
    var mock = mockPlugin(autohide);

    // Select an option.
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.unfolded,
      undefined,
      'when an option is clicked'
    );});

    mock.view.dropdownElement.emit('click');
    mock.model.patch.off('patch');

    // Blur the select.
    mock.model.patch.on('patch', function(patch) {is.equal(
      patch.unfolded,
      undefined,
      'when the select loses focus'
    );});

    mock.view.switchElement.emit('blur');

    setTimeout(function () {
      mock.model.patch.off('patch');

      // Blur it again by flicking the switch.
      mock.view.selectLabelElement.emit('mousedown');
      mock.view.switchElement.emit('blur');

      setTimeout(function () {
        mock.view.selectLabelElement.emit('click', {
          preventDefault: function() {is.pass(
            'keeps it hidden when the loss of focus came from flicking the ' +
            'switch'
          );},
        });

        mock.view.selectLabelElement.emit('click', {
          preventDefault: function() {is.fail(
            'doesn’t break the switch'
          );},
        });
      }, 100);
    }, 100);

    setTimeout(function () {

      // Blur the switch again by pressing the pointer over the select. Before
      // releasing the pointer, move it away from the select.
      mock.view.selectLabelElement.emit('mousedown');
      mock.view.switchElement.emit('blur');

      setTimeout(function () {
        mock.view.selectLabelElement.emit('mouseleave');
        mock.view.selectLabelElement.emit('click', {
          preventDefault: function() {is.fail(
            'not when the switch has been mousedowned but not mouseupped'
          );}
        });
      }, 100);
    }, 300);

    setTimeout(function () {

      // Click the switch without blurring it.
      mock.view.selectLabelElement.emit('mousedown');

      setTimeout(function () {
        mock.view.selectLabelElement.emit('click', {
          preventDefault: function() {is.fail(
            'not when the switch has been mousedowned but not blurred'
          );}
        });
      }, 100);
    }, 500);

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

var test = require('../test-tools/test')('“autohide” plugin');
var mockPlugin = require('../test-tools/mockPlugin');
var async = require('async');

var autohide = require('../../plugins/autohide');

test(
  'Hides the dropdown.',
  function(is) {
    var frameThrottle = 100;
    is.plan(3);

    // Prepare a set of async tests – each operating on its own mock select.
    var tests = [

      // Unfold a select and pick an option.
      function(done) {
        var mock = mockPlugin(autohide);
        mock.model.state.emit('unfolded', {attributes: {unfolded: ''}});

        mock.model.patch.on('patch', function(patch) {is.equal(
          patch.unfolded,
          undefined,
          'when an option is clicked'
        );});

        // The unfold is throttled until the next frame. So we need to postpone
        // every test.
        setTimeout(function() {
          mock.view.dropdownElement.emit('click');
          done();
        }, frameThrottle);
      },

      // Unfold a select and blur it.
      function(done) {
        var mock = mockPlugin(autohide);
        mock.model.state.emit('unfolded', {attributes: {unfolded: ''}});

        mock.model.patch.on('patch', function(patch) {is.equal(
          patch.unfolded,
          undefined,
          'when the select loses focus'
        );});

        setTimeout(function () {
          mock.view.switchElement.emit('blur');
          done();
        }, frameThrottle);
      },

      // Unfold another one, and blur it by flicking the switch.
      function(done) {
        var mock = mockPlugin(autohide);
        mock.model.state.emit('unfolded', {attributes: {unfolded: ''}});

        setTimeout(function() {
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

            done();
          }, frameThrottle);
        }, frameThrottle);
      },

      // Again, unfold a select. Then blur its switch by pressing the pointer
      // over the select. Before releasing the pointer, move it away from the
      // select though.
      function(done) {
        var mock = mockPlugin(autohide);
        mock.model.state.emit('unfolded', {attributes: {unfolded: ''}});

        setTimeout(function() {
          mock.view.selectLabelElement.emit('mousedown');
          mock.view.switchElement.emit('blur');

          setTimeout(function () {
            mock.view.selectLabelElement.emit('mouseleave');
            mock.view.selectLabelElement.emit('click', {
              preventDefault: function() {is.fail(
                'not when the switch has been mousedowned but not mouseupped'
              );}
            });

            done();
          }, frameThrottle);
        }, frameThrottle);
      },

      // Unfold a select. Click the switch without blurring it.
      function(done) {
        var mock = mockPlugin(autohide);
        mock.model.state.emit('unfolded', {attributes: {unfolded: ''}});

        setTimeout(function() {
          mock.view.selectLabelElement.emit('mousedown');

          setTimeout(function () {
            mock.view.selectLabelElement.emit('click', {
              preventDefault: function() {is.fail(
                'not when the switch has been mousedowned but not blurred'
              );}
            });

            done();
          }, frameThrottle);
        }, frameThrottle);
      },

      // Unfold another select, and blur it by clicking inside the dropdown.
      function(done) {
        var mock = mockPlugin(autohide);
        mock.model.state.emit('unfolded', {attributes: {unfolded: ''}});

        mock.model.patch.on('patch', function() {is.fail(
          'not when the blur was triggered by a click within the dropdown'
        );});

        setTimeout(function() {
          mock.view.switchElement.emit('blur');
          mock.view.dropdownElement.emit('mousedown');
          done();
        }, frameThrottle);
      },
    ];

    // Execute the async tests one after another.
    async.parallel(tests, function () {is.end();});
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

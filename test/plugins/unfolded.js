var test = require('../test-tools/test')('“unfolded” plugin');
var ø = require('stereo');

var unfolded = require('../../plugins/unfolded');

function mockView() { return {
  unfolded: ø(),
  containerElement: ø(),
}; }

function mockModel() { return {
  patches: ø(),
  updates: ø(),
}; }

test(
  'Flicks the switch when the attribute `unfolded` has changed.',
  function(is) {
    is.plan(2);

    // Initialize the plugin.
    var view = mockView();
    var model = mockModel();
    unfolded({
      view: view,
      model: model,
    });

    // Set up tests.
    var run = 1;
    view.unfolded.on('update', function (update) {
      if (run === 1) {
        is.equal(
          update.value,
          false,
          'switches it off when the attribute `unfolded` has gone away'
        );
      }

      else if (run === 2) {
        is.equal(
          update.value,
          true,
          'switches it back on when the attribute `unfolded` has been added'
        );
      }

      run++;
    });

    // Fire!
    model.updates.emit('unfolded', {});
    model.updates.emit('unfolded', {unfolded: ''});

    is.end();
  }
);

// TODO: Test plugin unregistering

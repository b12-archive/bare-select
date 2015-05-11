var test = require('../test-tools/test')('“unfolded” plugin');
var ø = require('stereo');
var createElement = require('../test-tools/createElement');
var h = require('virtual-dom/h');

var unfolded = require('../../plugins/unfolded');

function createSwitch(args) { return createElement(
  h('input', {
    type: 'checkbox',
    checked: !!args.on,
  })
);}

function mockView() { return {
  unfolded: ø(),
  switchElement: ø(),
}; }

function mockModel() { return {
  patches: ø(),
  updates: ø(),
}; }

test(
  'Patches the attribute `unfolded` when the switch is flicked.',
  function(is) {
    is.plan(4);

    // Initialize the plugin.
    var view = mockView();
    var model = mockModel();
    unfolded({
      view: view,
      model: model,
    });

    var anotherView = mockView();
    var anotherModel = mockModel();
    unfolded({
      view: anotherView,
      model: anotherModel,
    });

    // Set up tests.
    model.patches.on('apply', function (patch) {
      is.notOk(
        patch.hasOwnProperty('unfolded'),
        'removes it if the switch is off initially'
      );
    });

    var run = 1;
    anotherModel.patches.on('apply', function (patch) {
      if (run === 1) {
        is.ok(
          patch.hasOwnProperty('unfolded'),
          'adds it if the switch is on initially'
        );
      }

      else if (run === 2) {
        is.notOk(
          patch.hasOwnProperty('unfolded'),
          'removes it when the switch goes off'
        );
      }

      else if (run === 3) {
        is.ok(
          patch.hasOwnProperty('unfolded'),
          'adds it when the switch goes back on'
        );
      }

      else is.fail(
        'only applies patches when the switch changes value'
      );

      run++;
    });

    // Set fire!
    anotherView.switchElement.emit('change', {
      target: createSwitch({on: false})
    });
    view.switchElement.emit('change', {
      target: createSwitch({on: true})
    });
    view.switchElement.emit('change', {
      target: createSwitch({on: false})
    });
    view.switchElement.emit('change', {
      target: createSwitch({on: false})
    });
    view.switchElement.emit('change', {
      target: createSwitch({on: true})
    });

    is.end();
  }
);

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

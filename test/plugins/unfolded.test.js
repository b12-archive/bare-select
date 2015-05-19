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
  patch: ø(),
  state: ø(),
}; }

function mockInstance() {
  var view = mockView();
  var model = mockModel();
  unfolded({
    view: view,
    model: model,
  });

  return {view: view, model: model};
}

test(
  'Patches the attribute `unfolded` when the switch is flicked.',
  function(is) {
    is.plan(4);

    // Initialize the plugin.
    var mock = mockInstance();

    var anotherView = mockView();
    var anotherModel = mockModel();
    unfolded({
      view: anotherView,
      model: anotherModel,
    });

    // Set up tests.
    var run = 1;
    mock.model.patch.on('patch', function (patch) {
      if (run === 1) {
        is.equal(
          patch.unfolded,
          '',
          'adds it if the switch is on initially'
        );
      }

      else if (run === 2) {
        is.equal(
          patch.unfolded,
          undefined,
          'removes it when the switch goes off'
        );
      }

      else if (run === 3) {
        is.equal(
          patch.unfolded,
          '',
          'adds it when the switch goes back on'
        );
      }

      else is.fail(
        'only applies patch when the switch changes value'
      );

      run++;
    });

    anotherModel.patch.on('patch', function (patch) {
      is.equal(
        patch.unfolded,
        undefined,
        'removes it if the switch is off initially'
      );
    });

    // Set fire!
    anotherView.switchElement.emit('change', {
      target: createSwitch({on: false})
    });
    mock.view.switchElement.emit('change', {
      target: createSwitch({on: true})
    });
    mock.view.switchElement.emit('change', {
      target: createSwitch({on: false})
    });
    mock.view.switchElement.emit('change', {
      target: createSwitch({on: false})
    });
    mock.view.switchElement.emit('change', {
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
    var mock = mockInstance();

    // Set up tests.
    var run = 1;
    mock.view.unfolded.on('update', function (update) {
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
    mock.model.state.emit('unfolded', {attributes: {}});
    mock.model.state.emit('unfolded', {attributes: {unfolded: ''}});

    is.end();
  }
);

test(
  'Fails gracefully.',
  function(is) {
    is.plan(4);

    // Initialize the plugin.
    var mock = mockInstance();

    var test1Run = 1;
    function test1(error) {
      is.ok(
        test1Run++ <= 2 &&
        error.message.match(/invalid `unfolded` message/i),
        'emits an error when it receives a non-object as message'
      );
    }
    mock.view.unfolded.on('error', test1);
    mock.model.state.emit('unfolded', null);
    mock.model.state.emit('unfolded', {});
    mock.view.unfolded.off('error', test1);

    var test2Run = 1;
    function test2(error) {
      is.ok(
        test2Run++ <= 2 &&
        error.message.match(/expecting a dom event/i),
        'emits an error when it receives a non-event as message'
      );
    }
    mock.model.patch.on('error', test2);
    mock.view.switchElement.emit('change', null);
    mock.view.switchElement.emit('change', {});
    mock.model.patch.off('error', test2);

    is.end();
  }
);

// TODO: Test plugin unregistering

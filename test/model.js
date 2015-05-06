var h = require('virtual-dom/h');
var patch = require('virtual-dom/patch');
var diff = require('virtual-dom/diff');
var createElement = require('./test-tools/createElement');
var propertyType = require('./test-tools/propertyType');
var test = require('./test-tools/test')('The model');

var model = require('../module/model');

var virtualMock =
  h('bare-select', {attributes: {
    value: 'a',
    unfolded: '',
    unchanged: 'unchanged',
  }})
;
var virtualUpdate =
  h('bare-select', {attributes: {
    value: 'b',
    disabled: '',
    unchanged: 'unchanged',
  }})
;
var mock = createElement(virtualMock);

test('The API is in good shape.', function(is) {
  is.equal(
    typeof model,
    'function',
    'is a constructor function'
  );

  var modelInstance = model(mock);

  is.ok(
    Object.isFrozen(modelInstance),
    'returning a frozen object, and inside:'
  );

  is.deepEqual(
    modelInstance.patches && Object.keys(modelInstance.patches)
      .map(propertyType(modelInstance.patches))
    ,
    [
      {property: 'emit', type: 'function'},
    ],
    '• an input channel `patches`'
  );

  is.deepEqual(
    modelInstance.updates && Object.keys(modelInstance.updates)
      .map(propertyType(modelInstance.updates))
    ,
    [
      {property: 'on', type: 'function'},
      {property: 'when', type: 'function'},
    ],
    '• a cacheable output channel `updates`'
  );

  is.end();
});

test('The channel `updates` works alright.', {timeout: 2000}, function(is) {
  var modelInstance = model(mock);
  var firstRun = true;
  var valueState;

  is.plan(16);

  var justCalled = true;
  modelInstance.updates.when('value', function(state) {
    if (firstRun) {
      is.pass(
        'issues the event `value` for the attribute `value`'
      );

      is.ok(
        Object.isFrozen(state),
        '– passing an immutable state snapshot'
      );

      is.deepEqual(
        Object.keys(state),
        ['attributes'],
        '– with the key `attributes`'
      );

      is.ok(
        Object.isFrozen(state.attributes),
        '– with a frozen object inside'
      );

      is.deepEqual(
        Object.keys(state.attributes),
        ['value', 'unfolded', 'unchanged'],
        '– containing all attributes'
      );

      is.equal(
        state.attributes.value,
        'a',
        '– passing the current value of the attribute'
      );

      is.ok(justCalled,
        '– executing synchronously with a cached message'
      );

      valueState = state;
    }

    else {
      is.pass(
        'issues another `value` event when the attribute `value` changes'
      );

      is.deepEqual(
        Object.keys(state.attributes),
        ['value', 'unchanged', 'disabled'],
        '– passing an updated state'
      );

      is.equal(
        state.attributes.value,
        'b',
        '– with the updated value'
      );
    }
  });
  justCalled = false;

  modelInstance.updates.when('unfolded', function(state) {
    if (firstRun) {
      is.pass(
        'issues the event `unfolded` for the attribute `unfolded`'
      );

      is.equal(
        state,
        valueState,
        '– passing the same state as `value` did'
      );
    }

    else {
      is.pass(
        'issues another `unfolded` event when the attribute `unfolded` is ' +
        'removed'
      );

      is.equal(
        state.attributes.unfolded,
        undefined,
        '– passing `undefined`'
      );
    }
  });

  modelInstance.updates.when('disabled', function(state) {
    if (!firstRun) {
      is.pass(
        'issues the event `disabled` when the attribute `disabled` is added'
      );

      is.equal(
        state.attributes.disabled,
        '',
        '– passing its value'
      );
    }
  });

  modelInstance.updates.when('absent', function() {
    is.fail('an absent attribute shouldn’t receive an update');
  });

  // Trigger the second run.
  firstRun = false;
  setTimeout(function () {
    modelInstance.updates.on('unchanged', function() {
      is.fail('an unchanged attribute shouldn’t receive an update');
    });

    patch(mock, diff(virtualMock, virtualUpdate));
    modelInstance.attributeChangedCallback('value');
    modelInstance.attributeChangedCallback('disabled');
    modelInstance.attributeChangedCallback('unfolded');

    is.end();
  }, 100);
});

var h = require('virtual-dom/h');
var createElement = require('../test-tools/createElement');
var updateElement = require('../test-tools/updateElement');
var propertyType = require('../test-tools/propertyType');
var test = require('../test-tools/test')('The model');
var equal = require('1-liners/implode')(
  require('1-liners/equal')
);

var model = require('../../module/model');

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
function mockRoot() {
  return createElement(virtualMock);
}

test('The API is in good shape.', function(is) {
  is.equal(
    typeof model,
    'function',
    'is a constructor function'
  );

  var mock = mockRoot();
  var modelInstance = model(mock);

  is.ok(
    Object.isFrozen(modelInstance),
    'returning a frozen object, and inside:'
  );

  is.deepEqual(
    modelInstance.patch && Object.keys(modelInstance.patch)
      .map(propertyType(modelInstance.patch))
    ,
    [
      {property: 'emit', type: 'function'},
    ],
    '• an input channel `patch`'
  );

  is.deepEqual(
    modelInstance.state && Object.keys(modelInstance.state)
      .map(propertyType(modelInstance.state))
    ,
    [
      {property: 'on', type: 'function'},
      {property: 'when', type: 'function'},
    ],
    '• a cacheable output channel `state`'
  );

  is.end();
});

test('The channel `state` works alright.', {timeout: 2000}, function(is) {
  var mock = mockRoot();
  var modelInstance = model(mock);
  var firstRun = true;
  var valueState;

  is.plan(16);

  var justCalled = true;
  modelInstance.state.when('value', function(state) {
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

  modelInstance.state.when('unfolded', function(state) {
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

  modelInstance.state.when('disabled', function(state) {
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

  modelInstance.state.when('absent', function() {
    is.fail('an absent attribute shouldn’t receive an update');
  });

  // Trigger the second run.
  firstRun = false;
  setTimeout(function () {
    modelInstance.state.on('unchanged', function() {
      is.fail('an unchanged attribute shouldn’t receive an update');
    });

    updateElement(mock, virtualUpdate);
    modelInstance.attributeChangedCallback('value');
    modelInstance.attributeChangedCallback('disabled');
    modelInstance.attributeChangedCallback('unfolded');

    is.end();
  }, 100);
});

//  h('bare-select', {attributes: {
//    value: 'a',
//    unfolded: '',
//    unchanged: 'unchanged',
//  }})
test('The channel `patch` works alright.', {timeout: 2000}, function(is) {
  var mock = mockRoot();
  var modelInstance = model(mock);

  modelInstance.patch.emit('patch', {
    value: 'b'
  });
  is.equal(
    mock.getAttribute('value'),
    'b',
    'updates an attribute'
  );

  modelInstance.patch.emit('patch', {
    unfolded: undefined
  });
  is.notOk(
    mock.hasAttribute('unfolded'),
    'removes an attribute'
  );

  modelInstance.patch.emit('patch', {
    added: 'all is well!'
  });
  is.equal(
    mock.getAttribute('added'),
    'all is well!',
    'adds an attribute'
  );

  is.equal(
    mock.getAttribute('unchanged'),
    'unchanged',
    'doesn’t modify an arbitrary attribute'
  );

  modelInstance.patch.emit('patch', {
    added: 'changed',
    'another-one': 'added',
    value: undefined,
  });
  is.ok(
    [
      [  mock.getAttribute('added'),        'changed'    ],
      [  mock.getAttribute('another-one'),  'added'      ],
      [  mock.hasAttribute('value'),         false       ],
      [  mock.getAttribute('unchanged'),    'unchanged'  ],
    ].every(equal),
    'does all these at once'
  );

  is.end();
});

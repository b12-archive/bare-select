var h = require('virtual-dom/h');
var createElement = require('./test-tools/createElement');
var updateElement = require('./test-tools/updateElement');
var propertyType = require('./test-tools/propertyType');
var test = require('./test-tools/test')('The model');
var equal = require('1-liners/implode')(
  require('1-liners/equal')
);

var model = require('../module/model')();

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
  var modelInstance = model({root: mock});

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
      {property: 'catch', type: 'function'},
    ],
    '• an input channel `patch` with error handling'
  );

  is.deepEqual(
    modelInstance.state && Object.keys(modelInstance.state)
      .map(propertyType(modelInstance.state))
    ,
    [
      {property: 'on', type: 'function'},
      {property: 'when', type: 'function'},
      {property: 'off', type: 'function'},
    ],
    '• a cacheable output channel `state`'
  );

  is.end();
});

test('The channel `state` works alright.', function(is) {
  var mock = mockRoot();
  var modelInstance = model({root: mock});
  var firstRun = true;
  var valueState;

  is.plan(15);
  is.timeoutAfter(1000);

  modelInstance.state.when('value', function(state) {
    if (firstRun) {
      is.pass(
        'issues the event `value` for the attribute `value` initially'
      );

      is.ok(
        Object.isFrozen(state),
        '– passing an immutable state snapshot'
      );

      is.deepEqual(
        Object.keys(state),
        ['current'],
        '– with the key `current`'
      );

      is.ok(
        Object.isFrozen(state.current),
        '– with a frozen object inside'
      );

      is.deepEqual(
        Object.keys(state.current),
        ['value', 'unfolded', 'unchanged'],
        '– containing all current'
      );

      is.equal(
        state.current.value,
        'a',
        '– passing the current value of the attribute'
      );

      valueState = state;
    }

    else {
      is.pass(
        'issues another `value` event when the attribute `value` changes'
      );

      is.deepEqual(
        Object.keys(state.current),
        ['value', 'unchanged', 'disabled'],
        '– passing an updated state'
      );

      is.equal(
        state.current.value,
        'b',
        '– with the updated value'
      );
    }
  });

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
        state.current.unfolded,
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
        state.current.disabled,
        '',
        '– passing its value'
      );
    }
  });

  modelInstance.state.when('absent', function() {
    is.fail('an absent attribute shouldn’t receive an update');
  });

  // Trigger the second run.
  setTimeout(function () {
    firstRun = false;

    modelInstance.state.on('unchanged', function() {
      is.fail('an unchanged attribute shouldn’t receive an update');
    });

    updateElement(mock, virtualUpdate);
    modelInstance.attributeChangedCallback('value');
    modelInstance.attributeChangedCallback('disabled');
    modelInstance.attributeChangedCallback('unfolded');
  }, 100);
});

test('The channel `patch` works alright.', function(is) {
  var mock = mockRoot();
  var modelInstance = model({root: mock});

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

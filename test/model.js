var h = require('virtual-dom/h');
var createElement = require('./test-tools/createElement');
var test = require('./test-tools/test')('The model');

var model = require('../module/model');

var mock = createElement(
  h('bare-select')
);

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
    Object.keys(modelInstance.patches).map(function(key) {
      return {
        property: key,
        type: typeof modelInstance.patches[key],
      };
    }),
    [
      {property: 'emit', type: 'function'},
    ],
    '• an input channel `patches`'
  );

  is.deepEqual(
    Object.keys(modelInstance.updates).map(function(key) {
      return {
        property: key,
        type: typeof modelInstance.updates[key],
      };
    }),
    [
      {property: 'on', type: 'function'},
      {property: 'when', type: 'function'},
      {property: 'catch', type: 'function'},
    ],
    '• a cacheable output channel `updates` with error handling'
  );

  is.end();
});

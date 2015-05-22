var h = require('virtual-dom/h');
var createElement = require('../test-tools/createElement');
var propertyType = require('../test-tools/propertyType');
var test = require('../test-tools/test')('The view');
var repeat = require('repeat-element');
var arrayFrom = require('array-from');
var mockTree = require('../test-tools/mockTree');

var view = require('../../module/view');

test('The API is in good shape.', function(is) {
  is.equal(
    typeof view,
    'function',
    'is a constructor function'
  );

  var viewInstance = view(mockTree());

  is.ok(
    Object.isFrozen(viewInstance),
    'returning a frozen object, and inside:'
  );

  is.deepEqual(
    viewInstance.update && Object.keys(viewInstance.update)
      .map(propertyType(viewInstance.update))
    ,
    [
      {property: 'emit', type: 'function'},
      {property: 'catch', type: 'function'},
    ],
    '• an input channel `update` with error handling'
  );

  is.deepEqual(
    viewInstance.captionContent && Object.keys(viewInstance.captionContent)
      .map(propertyType(viewInstance.captionContent))
    ,
    [
      {property: 'emit', type: 'function'},
      {property: 'catch', type: 'function'},
    ],
    '• an input channel `captionContent` with error handling'
  );

  is.deepEqual(
    viewInstance.options && Object.keys(viewInstance.options)
      .map(propertyType(viewInstance.options))
    ,
    [
      {property: 'on', type: 'function'},
      {property: 'when', type: 'function'},
      {property: 'catch', type: 'function'},
    ],
    '• a cacheable output channel `options` with error handling'
  );

  is.deepEqual(
    viewInstance.switchElement && Object.keys(viewInstance.switchElement)
      .map(propertyType(viewInstance.switchElement))
    ,
    [{property: 'on', type: 'function'}],
    '• an output channel `switchElement`'
  );

  is.deepEqual(
    viewInstance.dropdownElement && Object.keys(viewInstance.dropdownElement)
      .map(propertyType(viewInstance.dropdownElement))
    ,
    [{property: 'on', type: 'function'}],
    '• an output channel `dropdownElement`'
  );

  is.deepEqual(
    viewInstance.error && Object.keys(viewInstance.error)
      .map(propertyType(viewInstance.error))
    ,
    [{property: 'catch', type: 'function'}],
    '• an error channel `error`'
  );

  is.end();
});

test('The channel `options` works alright.', function(is) {
  var viewInstance = view(mockTree());
  var executed;

  is.plan(5);

  executed = false;
  viewInstance.options.when('update', function(options) {
    if (executed) is.fail(
      'the event `update` should only come once'
    );

    is.pass(
      'issuing the event `update`'
    );

    is.deepEqual(
      options.values,
      ['a', 'b', 'c'],
      'with well-formed `values`'
    );

    var length = 3;
    is.deepEqual(
      options.radioNodes.map(function(node) {return {
        tagName: node.tagName,
        type: node.type,
      };}),
      repeat({
        tagName: 'INPUT',
        type: 'radio',
      }, length),
      'with well-formed `radioNodes`'
    );

    is.ok(
      options.radioNodes.map(function(node) {return {
        tagName: node.tagName,
      };}),
      repeat({
        tagName: 'LABEL',
      }, length),
      'with well-formed `labelNodes`'
    );

    executed = true;
  });

  is.ok(executed,
    'executing synchronously with a cached message'
  );

  is.end();
});

test('The channel `options` fails gracefully.', function(is) {
  is.plan(4);

  try {view(createElement(
    h('bare-select', [
      h('label'),
      h(),
    ])
  ));} catch (error) {
    is.ok(
      error.message.match(/switch element not found/i),
      'when the switch isn’t there'
    );
  }

  try {view(createElement(
    h('bare-select', [
      h('label'),
      h('input', {type: 'checkbox'}),
      h(),
    ])
  ));} catch (error) {
    is.ok(
      error.message.match(/dropdown element not found/i),
      'when the dropdown isn’t there'
    );
  }

  try {view(createElement(
    h('bare-select', [
      h('label'),
      h('input', {type: 'checkbox'}),
      h('ul', [
        h('wrong')
      ])
    ])
  ));} catch (error) {
    is.ok(
      error.message.match(/no options found in the dropdown/i),
      'when the dropdown is empty'
    );
  }

  try {view(createElement(
    h('bare-select', [
      h('label'),
      h('input', {type: 'checkbox'}),
      h('ul', [
        h('li', [
          h('wrong')
        ])
      ])
    ])
  ));} catch (error) {
    is.ok(
      error.message.match(/wrong option markup/i),
      'when options are badly formed'
    );
  }

  is.end();
});

test('`unfolded` on the channel `update` works alright.', function(is) {
  var tree = mockTree();
  var switchElement = tree.children[1];
  var viewInstance = view(tree);

  viewInstance.update.emit('unfolded', {newValue: true});
  is.equal(
    switchElement.checked,
    true,
    'checks the switch when it gets the value `true`'
  );

  viewInstance.update.emit('unfolded', {newValue: false});
  is.equal(
    switchElement.checked,
    false,
    'unchecks the switch when it gets the value `false`'
  );

  // TODO: Test failure.

  is.end();
});

test('`focused` on the channel `update` works alright.', function(is) {
  is.plan(2);

  var tree = mockTree();
  var switchElement = tree.children[1];
  var viewInstance = view(tree);

  var focusRun = 1;
  switchElement.focus = function () {
    if (focusRun++ === 1) is.pass(
      'calls `.focus()` on the switch when it gets the value `true`'
    );
    else is.fail(
      'only calls `.focus()` on the switch when it gets the value `true`'
    );
  };
  viewInstance.update.emit('focused', {newValue: true});

  var blurRun = 1;
  switchElement.blur = function () {
    if (blurRun++ === 1) is.pass(
      'calls `.blur()` on the switch when it gets the value `false`'
    );
    else is.fail(
      'only calls `.blur()` on the switch when it gets the value `false`'
    );
  };
  viewInstance.update.emit('focused', {newValue: false});

  // TODO: Test failure.

  is.end();
});

test('`selection` on the channel `update` works alright.', function(is) {
  var tree = mockTree();
  var radioElements = arrayFrom(tree.children[2].children)
    .map(function(item) {return item.children[0];})
  ;
  var viewInstance = view(tree);

  viewInstance.update.emit('selection', {newValue: 'a'});
  is.equal(
    radioElements[0].checked,
    true,
    'checks the right option when it gets an `update`'
  );

  viewInstance.update.emit('selection', {newValue: ''});
  is.notOk(
    radioElements.some(function(radio) {return radio.checked;}),
    'unchecks all options when it gets an `update` with the value `""`'
  );

  is.end();
});

test('`selection` on the `update` channel fails gracefully.', function(is) {
  is.plan(1);

  var tree = mockTree();
  var mockView = view(tree);

  mockView.error.catch(function(error) {is.ok(
    error.message.match(/value not found/i),
    'emits an `error` when it gets an invalid value'
  );});
  mockView.update.emit('selection', {newValue: 'invalid'});
  // TODO: uncatch this test

  is.end();
});
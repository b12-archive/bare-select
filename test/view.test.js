var h = require('virtual-dom/h');
var createElement = require('./test-tools/createElement');
var propertyType = require('./test-tools/propertyType');
var test = require('./test-tools/test')('The view');
var repeat = require('repeat-element');
var arrayFrom = require('array-from');
var mockTree = require('./test-tools/mockTree');

var view = require('../module/view')();

test('The API is in good shape.', function(is) {
  is.equal(
    typeof view,
    'function',
    'is a constructor function'
  );

  var viewInstance = view({root: mockTree()});

  is.ok(
    Object.isFrozen(viewInstance),
    'returning a frozen object, and inside:'
  );

  is.deepEqual(
    viewInstance.update &&
    Object.keys(viewInstance.update)
      .map(propertyType(viewInstance.update))
    ,
    [
      {property: 'emit', type: 'function'},
      {property: 'catch', type: 'function'},
    ],
    '• an input channel `update` with error handling'
  );

  is.deepEqual(
    viewInstance.options &&
    Object.keys(viewInstance.options)
      .map(propertyType(viewInstance.options))
    ,
    [
      {property: 'on', type: 'function'},
      {property: 'when', type: 'function'},
      {property: 'catch', type: 'function'},
    ],
    '• a promise-like output channel `options` with error handling'
  );

  var domChannelSignature = [
    {property: 'on', type: 'function'},
    {property: 'off', type: 'function'},
  ];

  is.deepEqual(
    viewInstance.switchElement &&
    Object.keys(viewInstance.switchElement)
      .map(propertyType(viewInstance.switchElement))
    ,
    domChannelSignature,
    '• an output DOM channel `switchElement`'
  );

  is.deepEqual(
    viewInstance.dropdownElement &&
    Object.keys(viewInstance.dropdownElement)
      .map(propertyType(viewInstance.dropdownElement))
    ,
    domChannelSignature,
    '• an output DOM channel `dropdownElement`'
  );

  is.deepEqual(
    viewInstance.selectLabelElement &&
    Object.keys(viewInstance.selectLabelElement)
      .map(propertyType(viewInstance.selectLabelElement))
    ,
    domChannelSignature,
    '• an output DOM channel `selectLabelElement`'
  );

  is.deepEqual(
    viewInstance.error &&
    Object.keys(viewInstance.error)
      .map(propertyType(viewInstance.error))
    ,
    [
      {property: 'catch', type: 'function'},
      {property: 'off', type: 'function'},
    ],
    '• an error channel `error`'
  );

  is.end();
});

test('The channel `options` works alright.', function(is) {
  var viewInstance = view({root: mockTree()});
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

    is.deepEqual(
      options.labelNodes.map(function(node) {return {
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
  is.plan(6);

  try {view({root: createElement(
    h('bare-select', [
      h(),
      h('input', {type: 'checkbox'}),
    ])
  )});} catch (error) {
    is.ok(
      error.message.match(/can’t find the (?:select label|caption) element/i),
      'when the select label or caption isn’t there'
    );
  }

  try {view({root: createElement(
    h('bare-select', [
      h('label'),
      h(),
    ])
  )});} catch (error) {
    is.ok(
      error.message.match(/can’t find the switch element/i),
      'when the switch isn’t there'
    );
  }

  try {view({root: createElement(
    h('bare-select', [
      h('label'),
      h('input', {type: 'checkbox'}),
      h(),
    ])
  )});} catch (error) {
    is.ok(
      error.message.match(/can’t find the dropdown element/i),
      'when the dropdown isn’t there'
    );
  }

  try {view({root: createElement(
    h('bare-select', [
      h('label'),
      h('input', {type: 'checkbox'}),
      h('ul', [
        h('wrong')
      ])
    ])
  )});} catch (error) {
    is.ok(
      error.message.match(/can’t find any option element/i),
      'when the dropdown is empty'
    );
  }

  try {view({root: createElement(
    h('bare-select', [
      h('label'),
      h('input', {type: 'checkbox'}),
      h('ul', [
        h('li', [
          h('wrong')
        ])
      ])
    ])
  )});} catch (error) {
    is.ok(
      error.message.match(/wrong markup within options/i),
      'when there’s no radio button in one of the options'
    );
  }

  try {view({root: createElement(
    h('bare-select', [
      h('label'),
      h('input', {type: 'checkbox'}),
      h('ul', [
        h('li', [
          h('input', {type: 'radio'}),
          h('wrong')
        ])
      ])
    ])
  )});} catch (error) {
    is.ok(
      error.message.match(/wrong markup within options/i),
      'when there’s no label in one of the options'
    );
  }

  is.end();
});

test('`unfolded` on the channel `update` works alright.', function(is) {
  var tree = mockTree();
  var switchElement = tree.children[1];
  var viewInstance = view({root: tree});

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
  var viewInstance = view({root: tree});

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

test('`captionContent` on the channel `update` works alright.', function(is) {
  var tree = mockTree();
  var viewInstance = view({root: tree});
  var caption = tree.children[0];

  var mockContent = createElement(h('div'));
  viewInstance.update.emit('captionContent', {newDOM: mockContent});

  is.equal(
    caption.children[0],
    mockContent,
    'replaces content of the caption'
  );

  is.equal(
    caption.children.length,
    1,
    'leaves no other content inside'
  );

  is.end();
});

test(
  '`captionContent` on the channel `update` fails gracefully.',
  function(is) {
    is.plan(3);

    var tree = mockTree();
    var viewInstance = view({root: tree});
    var caption = tree.children[0];
    var captionContent = arrayFrom(caption.children);

    viewInstance.error.catch(function(error) {is.ok(
      error.message.match(/invalid `captionContent` message/i),
      'emits an error if passed a non-object in the message'
    );});

    viewInstance.update.emit('captionContent', null);
    viewInstance.error.off('error');

    viewInstance.error.catch(function(error) {is.ok(
      error.message.match(/invalid `captionContent` message/i),
      'emits an error if passed non-DOM in the message'
    );});

    viewInstance.update.emit('captionContent', {newDOM: 'invalid'});
    viewInstance.error.off('error');

    is.deepEqual(
      caption.children,
      captionContent,
      'leaves contents of the caption intact'
    );

    is.end();
  }
);

test('`selection` on the channel `update` works alright.', function(is) {
  var tree = mockTree();
  var radioElements = arrayFrom(tree.children[2].children)
    .map(function(item) {return item.children[0];})
  ;
  var viewInstance = view({root: tree});

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
  var mockView = view({root: tree});

  mockView.error.catch(function(error) {is.ok(
    error.message.match(/value not found/i),
    'emits an `error` when it gets an invalid value'
  );});
  mockView.update.emit('selection', {newValue: 'invalid'});
  // TODO: uncatch this test

  is.end();
});

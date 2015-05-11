var h = require('virtual-dom/h');
var createElement = require('../test-tools/createElement');
var propertyType = require('../test-tools/propertyType');
var test = require('../test-tools/test')('The view');
var repeat = require('repeat-element');

var view = require('../../module/view');

var mock = createElement(
  h('bare-select', [
    h('label', {for: 'switch'}),
    h('input', {type: 'checkbox', id: 'switch'}),
    h('ul', [
      h('li', [
        h('input', {type: 'radio', name: 'radio-group',
          value: 'a',
        }),
      ]),
      h('li', [
        h('input', {type: 'radio', name: 'radio-group',
          value: 'b',
          checked: '',
        }),
      ]),
      h('li', [
        h('input', {type: 'radio', name: 'radio-group',
          value: 'c',
        }),
      ]),
    ]),
  ])
);

test('The API is in good shape.', function(is) {
  is.equal(
    typeof view,
    'function',
    'is a constructor function'
  );

  var viewInstance = view(mock);

  is.ok(
    Object.isFrozen(viewInstance),
    'returning a frozen object, and inside:'
  );

  is.deepEqual(
    viewInstance.selection && Object.keys(viewInstance.selection)
      .map(propertyType(viewInstance.selection))
    ,
    [{property: 'emit', type: 'function'}],
    '• an input channel `selection`'
  );
  // TODO: Is the `selection` channel needed?

  is.deepEqual(
    viewInstance.captionContent && Object.keys(viewInstance.captionContent)
      .map(propertyType(viewInstance.captionContent))
    ,
    [{property: 'emit', type: 'function'}],
    '• an input channel `captionContent`'
  );

  is.deepEqual(
    viewInstance.unfolded && Object.keys(viewInstance.unfolded)
      .map(propertyType(viewInstance.unfolded))
    ,
    [{property: 'emit', type: 'function'}],
    '• an input channel `unfolded`'
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
    viewInstance.containerElement && Object.keys(viewInstance.containerElement)
      .map(propertyType(viewInstance.containerElement))
    ,
    [{property: 'on', type: 'function'}],
    '• an output channel `containerElement`'
  );

  is.end();
});

test('The channel `options` works alright.', function(is) {
  var viewInstance = view(mock);
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
  is.throws(
    function() {view(createElement(
      h('bare-select')
    ));},
    'when the dropdown isn’t there'
  );

  is.throws(
    function() {view(createElement(
      h('bare-select', [
        h(),
        h(),
        h('ul', [
          h('wrong')
        ])
      ])
    ));},
    'when the dropdown is empty'
  );

  is.throws(
    function() {view(createElement(
      h('bare-select', [
        h(),
        h(),
        h('ul', [
          h('li', [
            h('wrong')
          ])
        ])
      ])
    ));},
    'when options are badly formed'
  );

  is.end();
});

test('The channel `unfolded` works alright.', function(is) {
  var tree = mock;
  var switchElement = tree.children[1];
  var viewInstance = view(tree);

  viewInstance.unfolded.emit('update', {value: true});
  is.equal(
    switchElement.checked,
    true,
    'checks the switch when it gets the value `true`'
  );

  viewInstance.unfolded.emit('update', {value: false});
  is.equal(
    switchElement.checked,
    false,
    'unchecks the switch when it gets the value `false`'
  );

  // TODO: Test failure.

  is.end();
});

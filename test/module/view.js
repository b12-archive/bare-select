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
    viewInstance.captionElement && Object.keys(viewInstance.captionElement)
      .map(propertyType(viewInstance.captionElement))
    ,
    [{property: 'on', type: 'function'}],
    '• an output channel `captionElement`'
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

    var optionValues = options && Object.keys(options);
    is.deepEqual(
      optionValues,
      ['a', 'b', 'c'],
      'with 3 options categorized by value'
    );

    is.deepEqual(
      optionValues.map(function(value) {
        return options[value].node && options[value].node.tagName;
      }),
      repeat('LI', optionValues.length),
      'with every option containing the `<li>` element in `.node`'
    );

    is.deepEqual(
      optionValues.map(function(value) {
        return options[value].radioNode && options[value].radioNode.tagName;
      }),
      repeat('INPUT', optionValues.length),
      '– and the `<input>` element in `.radioNode`'
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

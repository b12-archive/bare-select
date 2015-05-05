var jsdom = require('jsdom').jsdom;
var h = require('virtual-dom/h');
var curryRight2 = require('1-liners/curryRight2');
var test = require('./test-tools/test')('The view');
var createElement = curryRight2(require('virtual-dom/create-element'))(
  {document: (
    (typeof window !== 'undefined' && window.document) ||
    jsdom().defaultView.document
  )}
);

var view = require('../module/view');

var goodMock = createElement(
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

  var viewInstance = view(goodMock);

  is.ok(
    Object.isFrozen(viewInstance),
    'returning a frozen object, and inside:'
  );

  is.deepEqual(
    Object.keys(viewInstance.selection).map(function(key) {
      return {
        property: key,
        type: typeof viewInstance.selection[key],
      };
    }),
    [
      {property: 'emit', type: 'function'},
    ],
    '• an input channel `selection`'
  );

  is.deepEqual(
    Object.keys(viewInstance.captionContent).map(function(key) {
      return {
        property: key,
        type: typeof viewInstance.captionContent[key],
      };
    }),
    [
      {property: 'emit', type: 'function'},
    ],
    '• an input channel `captionContent`'
  );

  is.deepEqual(
    Object.keys(viewInstance.unfolded).map(function(key) {
      return {
        property: key,
        type: typeof viewInstance.unfolded[key],
      };
    }),
    [
      {property: 'emit', type: 'function'},
    ],
    '• an input channel `unfolded`'
  );

  is.deepEqual(
    Object.keys(viewInstance.options).map(function(key) {
      return {
        property: key,
        type: typeof viewInstance.options[key],
      };
    }),
    [
      {property: 'on', type: 'function'},
      {property: 'when', type: 'function'},
      {property: 'catch', type: 'function'},
    ],
    '• a cacheable output channel `options` with error handling'
  );

  is.deepEqual(
    Object.keys(viewInstance.captionElement).map(function(key) {
      return {
        property: key,
        type: typeof viewInstance.captionElement[key],
      };
    }),
    [
      {property: 'on', type: 'function'},
    ],
    '• an output channel `captionElement`'
  );

  is.end();
});

test('The channel `options` works alright.', function(is) {
  var viewInstance = view(goodMock);
  var executed;

  is.plan(3);

  executed = false;
  viewInstance.options.when('update', function(options) {
    is.pass(
      'issuing the event `update`'
    );

    is.deepEqual(
      Object.keys(options),
      ['a', 'b', 'c'],
      'with 3 options categorized by value'
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

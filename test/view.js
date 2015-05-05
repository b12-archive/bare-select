import {jsdom} from 'jsdom';
import _test from './test-tools/test';
import _createElement from 'virtual-dom/create-element';
import h from 'virtual-dom/h';
import {curryRight2} from '1-liners';

import _view from '../module/view';

const test = _test('The view');
const createElement = curryRight2(_createElement)({document: (
  (typeof window !== 'undefined' && window.document) ||
  jsdom().defaultView.document
)});

const goodMock = createElement(
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

test('The API is in good shape.', (is) => {
  is.equal(
    typeof _view,
    'function',
    'is a constructor function'
  );

  const view = _view(goodMock);

  is.ok(
    Object.isFrozen(view),
    'returning a frozen object, and inside:'
  );

  is.deepEqual(
    Object.keys(view.selection).map((key) => ({
      property: key,
      type: typeof view.selection[key],
    })),
    [
      {property: 'emit', type: 'function'},
    ],
    '• an input channel `selection`'
  );

  is.deepEqual(
    Object.keys(view.captionContent).map((key) => ({
      property: key,
      type: typeof view.captionContent[key],
    })),
    [
      {property: 'emit', type: 'function'},
    ],
    '• an input channel `captionContent`'
  );

  is.deepEqual(
    Object.keys(view.options).map((key) => ({
      property: key,
      type: typeof view.options[key],
    })),
    [
      {property: 'on', type: 'function'},
      {property: 'when', type: 'function'},
      {property: 'catch', type: 'function'},
    ],
    '• a cacheable output channel `options` with error handling'
  );

  is.deepEqual(
    Object.keys(view.captionElement).map((key) => ({
      property: key,
      type: typeof view.captionElement[key],
    })),
    [
      {property: 'on', type: 'function'},
    ],
    '• an output channel `captionElement`'
  );

  is.end();
});

test('Output channels work alright.', (is) => {
  const view = _view(goodMock);
  let executed;

  is.plan(3);

  executed = false;
  view.options.when('update', (options) => {
    is.pass('the event `update` comes on the `options` channel');

    is.deepEqual(
      Object.keys(options),
      ['a', 'b', 'c'],
      '– with 3 options categorized by value'
    );

    executed = true;
  });

  is.ok(executed,
    '– executed synchronously with a cached value'
  );

  is.end();
});

import {jsdom} from 'jsdom';
import _test from './test-tools/test';
import _createElement from 'virtual-dom/create-element';
import h from 'virtual-dom/h';
import {curryRight2} from '1-liners';

import view from '../module/view';

const test = _test('The view');
const doc = (
  (typeof window !== 'undefined' && window.document) ||
  jsdom().defaultView.document
);
const createElement = curryRight2(_createElement)({document: doc});

const goodMock = createElement(
  h('bare-select', [
    h('label', {for: 'switch'}),
    h('input', {type: 'checkbox', id: 'switch'}),
    h('ul', [
      h('li', [
        h('input', {type: 'radio', name: 'radio-group',
          value: 'a',
        }),
        h('input', {type: 'radio', name: 'radio-group',
          value: 'b',
          checked: '',
        }),
        h('input', {type: 'radio', name: 'radio-group',
          value: 'c',
        }),
      ]),
    ]),
  ])
);

test('The API is in good shape.', (is) => {
  is.equal(
    typeof view,
    'function',
    'is a constructor function'
  );

  is.end();
});

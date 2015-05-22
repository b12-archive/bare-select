var h = require('virtual-dom/h');
var createElement = require('../test-tools/createElement');

module.exports = function() {return createElement(
  h('bare-select', [
    h('label', {for: 'switch'}),
    h('input', {type: 'checkbox', id: 'switch'}),
    h('ul', [
      h('li', [
        h('input', {type: 'radio', name: 'radio-group',
          value: 'a',
        }),
        h('label'),
      ]),
      h('li', [
        h('input', {type: 'radio', name: 'radio-group',
          value: 'b',
          checked: true,
        }),
        h('label'),
      ]),
      h('li', [
        h('input', {type: 'radio', name: 'radio-group',
          value: 'c',
        }),
        h('label'),
      ]),
    ]),
  ])
);};

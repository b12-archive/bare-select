var createElement = require('../test-tools/createElement');
var h = require('virtual-dom/h');

module.exports = function(args) {return createElement(
  h('input', {
    type: 'checkbox',
    checked: !!args.on,
  })
);};

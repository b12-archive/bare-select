var h = require('virtual-dom/h');

module.exports = function(args) {
  return (
    h('input', {
      type: 'radio',
      value: args.value,
      checked: args.checked,
    })
  );
};

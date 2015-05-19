var error = require('./error');

module.exports = function(rootChildren) {
  if (
    rootChildren[1] &&
    rootChildren[1].tagName === 'INPUT' &&
    rootChildren[1].type.toLowerCase() === 'checkbox'
  ) return {value:
    rootChildren[1]
  };
  else return {error: error(
    'Visibility switch element not found. The second element in a ' +
    '`<bare-select>` should be the switch – an `<input type="checkbox">` ' +
    'element.'
  )};
};

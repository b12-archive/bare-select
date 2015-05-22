var error = require('./error');

module.exports = function(rootChildren) {
  var dropdown = rootChildren[2];
  if (!dropdown || dropdown.tagName !== 'UL') return {error: error(
    'Dropdown element not found. The third element in a `<bare-select>` ' +
    'should be the dropdown – a `<ul>` element.'
  )};

  return {value: dropdown};
};

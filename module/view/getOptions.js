var error = require('./error');

module.exports = function(dropdown) {
  var options = Array.prototype.slice.call(dropdown.children)
    .filter(function(element) {return element.tagName === 'LI';})
  ;

  if (!options.length) return {error: error(
    'No options found in the dropdown. Every option should be a `<li>` ' +
    'element with a radio button.'
  )};

  else if (options.some(function(item) {
    return (
      !item.children[0] ||
      item.children[0].tagName !== 'INPUT' ||
      !item.children[1] ||
      item.children[1].tagName !== 'LABEL'
    );
  })) return {error: error(
    'Wrong option markup. The first element in every dropdown option ' +
    '(`<li>`) should be an `<input>` – a radio button or checkbox. ' +
    'The second element should be a `<label>`.'
  )};

  return {value: {
    values: options.map(
      function(item) {return item.children[0].value;}
    ),
    radioNodes: options.map(
      function(item) {return item.children[0];}
    ),
    labelNodes: options.map(
      function(item) {return item.children[1];}
    ),
  }};
};

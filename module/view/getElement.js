var error = require('./error');

module.exports = function(genericArgs) {

  // Required generic args:
  var root = genericArgs.root;

  return function(args) {
    // Required args:
    var selector = args.selector;
    var elementName = args.elementName;

    // Optional args:
    var multiple = (args.multiple ? true : false);

    // Find the element/elements.
    var result = (multiple ?
      root.querySelectorAll(selector) :
      root.querySelector(selector)
    );

    // Validate and return the result.
    if (multiple ?
      !result.length :
      !result
    ) return {error: error(
      'We can’t find ' +
      (multiple ? 'any ' : 'the ') + elementName + ' ' +
      'element. It should match the selector `' +
      selector +
      '`. Make sure there ' +
      (multiple ? 'are such elements ' : 'is such an element ') +
      'in your `<bare-select>`.'
    )};

    else return {value: result};
  };
};

// SOON [#6899]: Split this out into another module.
module.exports = function (element, patch) {
  Object.keys(patch).forEach(function(attribute) {
    var value = patch[attribute];
    if (value === undefined) element.removeAttribute(attribute);
    else element.setAttribute(attribute, value);
  });
};

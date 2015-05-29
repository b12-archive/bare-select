// TODO: Split this out into another module.
module.exports = function(settings, message) {
  var source = settings.source || null;

  var labeled = (
    'bare-select' + (source ?
      ' (' + source + ')' :
      ''
    ) + ': ' +
    message
  );

  return {
    message: labeled,
    name: 'BareSelectError',
    toString: function() {return labeled;},
  };
};

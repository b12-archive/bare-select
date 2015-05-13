module.exports = function(message) {
  var labeled = '<bare-select>: ' + message;

  return {
    message: labeled,
    toString: function() {return labeled;}
  };
};

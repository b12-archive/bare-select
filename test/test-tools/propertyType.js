module.exports = function(object) {
  return function propertyType(key) {
    return {
      property: key,
      type: typeof object[key],
    };
  };
};

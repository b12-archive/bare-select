module.exports = function(element) {
  return Object.freeze({
    on: element.addEventListener.bind(element),
    off: element.removeEventListener.bind(element),
  });
};

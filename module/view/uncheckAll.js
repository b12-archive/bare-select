module.exports = function(radioNodes) {
  radioNodes.forEach(function(radio) {
    radio.checked = false;
  });
};

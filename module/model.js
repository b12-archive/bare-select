var øEmit = require('stereo/emit');
var øOn = require('stereo/on');
var øWhen = require('stereo/when');
var asObject = require('as/object');

module.exports = function model(rootElement) {
  var rootAttributes = rootElement.attributes;

  // Initialize the input channel `patches`.
  var patches = Object.freeze({
    emit: øEmit(),
  });

  // Initialize the output channel `updates`.
  var emitUpdates = øEmit();
  var updates = Object.freeze({
    on: øOn(emitUpdates),
    when: øWhen(emitUpdates),
  });

  // Emit initial messages to `updates`.
  var attributesArray = Array.prototype.slice.call(rootAttributes);
  emitUpdates(
    attributesArray.map(function(attribute) {return attribute.name;}),
    Object.freeze({
      attributes: Object.freeze(
        asObject(attributesArray.map(function (attribute) {
          return {
            key: attribute.name,
            value: attribute.value,
          };
        }))
      ),
    })
  );

  return Object.freeze({
    patches: patches,
    updates: updates,
  });
};

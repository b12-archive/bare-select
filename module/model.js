var øEmit = require('stereo/emit');
var øOn = require('stereo/on');
var øWhen = require('stereo/when');
var asObject = require('as/object');
var asap = require('set-immediate-shim');

function attributeUpdater(args) {

  // Read args.
  var emitter = args.emitter;
  var attributesObject = args.attributesObject;

  // Make sure we emit one event for batch attribute updates.
  var executedInThisLoop = false;
  function resetLoop() {executedInThisLoop = false;}

  return function emitUpdate() {
    if (executedInThisLoop) return;
    executedInThisLoop = true;
    asap(resetLoop);

    // Parse attributes and emit an object. See the specs for more info.
    var attributesArray = Array.prototype.slice.call(attributesObject);
    emitter(
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
  };
}

module.exports = function model(rootElement) {

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
  var emitCurrentAttributes = attributeUpdater({
    emitter: emitUpdates,
    attributesObject: rootElement.attributes,
  });

  // Emit initial messages to `updates`.
  emitCurrentAttributes();

  return Object.freeze({
    patches: patches,
    updates: updates,
  });
};

var øEmit = require('stereo/emit');
var øOn = require('stereo/on');
var øWhen = require('stereo/when');
var attributeUpdater = require('./model/attributeUpdater');

// TODO: Document the function.
module.exports = function model(rootElement) {

  // Initialize the input channel `patches`.
  var emitPatches = øEmit();
  var patches = Object.freeze({
    emit: emitPatches,
  });
  var onPatches = øOn(emitPatches);

  onPatches('apply', function (patch) {
    Object.keys(patch).forEach(function(attribute) {
      var value = patch[attribute];
      if (value === undefined) rootElement.removeAttribute(attribute);
      else rootElement.setAttribute(attribute, value);
    });
  });

  // Initialize the output channel `updates`.
  var emitUpdates = øEmit();
  var updates = Object.freeze({
    on: øOn(emitUpdates),
    when: øWhen(emitUpdates),
  });
  // TODO: Add `off`.
  var emitCurrentAttributes = attributeUpdater({
    emitter: emitUpdates,
    attributesObject: rootElement.attributes,
  });

  // Emit initial messages to `updates`.
  emitCurrentAttributes();

  // Export channels and `attributeChangedCallback`.
  return Object.freeze({
    patches: patches,
    updates: updates,
    attributeChangedCallback: emitCurrentAttributes,
  });
};

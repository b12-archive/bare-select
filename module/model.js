require('es6-set/implement');

var emit = require('stereo/emit');
var on = require('stereo/on');
var off = require('stereo/off');
var snatch = require('stereo/catch');
var when = require('stereo/when');
var attributeUpdater = require('./model/attributeUpdater');
var patchAttributes = require('./model/patchAttributes');
var curry = require('1-liners/curry');

// TODO: Document the function.
module.exports = function model(rootElement) {

  // Initialize the input channel `patch`.
  var emitPatches = emit();
  var patch = Object.freeze({
    emit: emitPatches,
    catch: snatch(emitPatches),
  });
  on(emitPatches)('patch',
    curry(patchAttributes)(rootElement)
  );

  // Initialize the output channel `state`.
  var emitUpdates = emit();
  var state = Object.freeze({
    on: on(emitUpdates),
    when: when(emitUpdates),
    off: off(emitUpdates),
  });
  // TODO: Add `off`.
  var emitCurrentAttributes = attributeUpdater({
    emitter: emitUpdates,
    attributesObject: rootElement.attributes,
  });

  // Emit initial messages to `state`.
  emitCurrentAttributes();

  // Export channels and `attributeChangedCallback`.
  return Object.freeze({
    patch: patch,
    state: state,
    attributeChangedCallback: emitCurrentAttributes,
  });
};

require('es6-set/implement');

var emit = require('stereo/emit');
var on = require('stereo/on');
var off = require('stereo/off');
var snatch = require('stereo/catch');
var when = require('stereo/when');
var attributeUpdater = require('./model/attributeUpdater');
var patchAttributes = require('./model/patchAttributes');
var curry = require('1-liners/curry');

 /**
  * A model based on a custom element.
  *
  * The state of the model is stored as attributes on a custom element.
  * Changing an attribute will update the model, and patching the model’s state
  * will update the attribute.
  *
  * @module  {Function}  bare-select/module/model
  *
  * @returns  {modelMaker}  customElementModel
  */
module.exports = function() {return function(args) {
  var root = args.root;

   /**
    * Patch the model’s state.
    *
    * Passing a `String` will update the value of the attribute
    * `attributeName`. Passing `null` will remove the attribute.
    *
    * @event      model.patch#patch
    * @protected
    *
    * @type      {Object}
    * @property  {...(String|null)}  (attributeName)
    */
  var emitPatches = emit();
  var patch = Object.freeze({
    emit: emitPatches,
    catch: snatch(emitPatches),
  });

  on(emitPatches)('patch',
    curry(patchAttributes)(root)
  );

   /**
    * The model’s state has been updated.
    *
    * An event will be issued for every changed attribute. So the listeners
    * `'value'` and `'unfolded'` will be notified asynchronously after
    * running this:
    *
    *     bareSelect.setAttribute('value', 'abc');
    *     bareSelect.removeAttribute('unfolded');
    *
    * @event      model.state#(attributeName)
    * @protected
    *
    * @type      {Object}
    * @property  {Object}     current
    *   The state of all attributes
    * @property  {...String}  current.(attributeName)
    */
  var emitUpdates = emit();
  var state = Object.freeze({
    on: on(emitUpdates),
    when: when(emitUpdates),
    off: off(emitUpdates),
  });

  var attributeChangedCallback = attributeUpdater({
    emitter: emitUpdates,
    attributesObject: root.attributes,
  });

  // Emit initial messages to `state`.
  attributeChangedCallback();

  // Export channels and `attributeChangedCallback`.
  return Object.freeze({
    patch: patch,
    state: state,
    attributeChangedCallback: attributeChangedCallback,
  });
};};

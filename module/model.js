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
  * Create a new custom-element-based model.
  *
  * @param  {HTMLElement}  rootElement
  *   The `<bare-select>` element.
  *
  * @returns  {Object}    model
  * @returns  {ø input}   model.patch
  * @returns  {Function}  model.patch.emit
  * @returns  {Function}  model.patch.catch
  * @returns  {ø output}  model.state
  * @returns  {Function}  model.state.on
  * @returns  {Function}  model.state.when
  * @returns  {Function}  model.state.off
  *
  * @listens  model.patch#patch
  * @listens  model.patch#error
  * @fires    model.state#<attributeName>
  *
  * @protected
  * @function
  * @module     bare-select/module/model
  */
module.exports = function model(rootElement) {

   /**
    * Patch the model’s state.
    *
    * @protected
    * @event      model.patch#patch
    *
    * @type      {Object}
    * @property  {...(String|null)}  <attributeName>
    */
  var emitPatches = emit();
  var patch = Object.freeze({
    emit: emitPatches,
    catch: snatch(emitPatches),
  });

  on(emitPatches)('patch',
    curry(patchAttributes)(rootElement)
  );

   /**
    * The model’s state has been updated.
    *
    * @protected
    * @event      model.state#<attributeName>
    *
    * @type      {Object}
    * @property  {Object}     current
    * @property  {...String}  current.<attributeName>
    */
  var emitUpdates = emit();
  var state = Object.freeze({
    on: on(emitUpdates),
    when: when(emitUpdates),
    off: off(emitUpdates),
  });

  var attributeChangedCallback = attributeUpdater({
    emitter: emitUpdates,
    attributesObject: rootElement.attributes,
  });

  // Emit an initial messages to `state`.
  attributeChangedCallback();

  // Export channels and `attributeChangedCallback`.
  return Object.freeze({
    patch: patch,
    state: state,
    attributeChangedCallback: attributeChangedCallback,
  });
};

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
  * @typedef    model
  * @protected
  *
  * @type      {Object}
  * @property  {ø-input}   patch
  * @property  {ø-output}  state
  *
  * @listens  model.patch#patch
  * @listens  model.patch#error
  * @fires    model.state#(attributeName)
  */
 // TODO: * @property  {String}  version
 //       *   The exact string `'0'`

 /**
  * Create a new custom-element-based model.
  *
  * The state of the model is stored as attributes on a custom element.
  * Changing the attribute manually will also update the model.
  *
  * @module     {Function}  bare-select/module/model
  * @protected
  *
  * @param  {HTMLElement}  rootElement
  *   The `<bare-select>` element.
  *
  * @returns  {model}
  */
module.exports = function model(rootElement) {

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
    curry(patchAttributes)(rootElement)
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
    attributesObject: rootElement.attributes,
  });

  // Emit initial messages to `state`.
  attributeChangedCallback();

  // Export channels and `attributeChangedCallback`.
  return Object.freeze({
    patch: patch,
    state: state,
    attributeChangedCallback: attributeChangedCallback,
  });
};

require('es6-set/implement');

var emit = require('stereo/emit');
var on = require('stereo/on');
var when = require('stereo/when');
var snatch = require('stereo/catch');
var off = require('stereo/off');
var curry = require('1-liners/curry');
var asObject = require('as/object');
var spacify = require('reassemble-string')(function(lastLetter, firstLetter) {
  return lastLetter + ' ' + firstLetter.toLowerCase();
});
var assign = require('object-assign');

var error = require('./view/error');
var uncheckAll = require('./view/uncheckAll');
var inputChannel = require('./view/inputChannel');
var getElement_ = require('./view/getElement');
var getOptions = require('./view/getOptions');
var domChannel = require('./view/domChannel');

 /**
  * Create a new pure HTML view. Here’s the pseudo-markup it’s designed for:
  *
  *     <bare-select>                        │ • The custom element
  *       <select-label>                     │ • A `<label>` for the switch
  *         <caption></caption>              │ • The content displayed in the
  *                                          │   select box
  *       </select-label>                    │
  *                                          │
  *       <switch />                         │ • A checkbox controlling the
  *                                          │   dropdown’s visibility
  *       <dropdown>                         │ • A list of options
  *         <option>                         │ • A list item
  *           <option-radio />               │ • A radio button – its `value`
  *                                          │   attribute is the value of the
  *                                          │   option
  *           <option-label></option-label>  │ • The content displayed in the
  *                                          │   option
  *         </option>                        │
  *       </dropdown>                        │
  *     </bare-select>                       │
  *
  * @param  {HTMLElement}  rootElement
  *   The `<bare-select>` element. It should contain
  * @param  {[Object]}     options
  *
  * @param  {[Object]}  options.selectors
  * @param  {[String='bare-select > label']}
  *   options.selectors.caption
  * @param  {[String='bare-select > label']}
  *   options.selectors.selectLabel
  * @param  {[String='bare-select > input[type=checkbox]']
  *   options.selectors.switch
  * @param  {[String='bare-select > ul']}
  *   options.selectors.dropdown
  * @param  {[String='bare-select > ul > li']}
  *   options.selectors.option
  * @param  {[String='input[type=radio]']
  *   options.selectors.optionRadio
  * @param  {[String='label']}
  *   options.selectors.optionLabel
  *
  * @returns  {view}
  *
  * @protected
  * @function
  * @module     bare-select/module/view
  */
module.exports = function view(rootElement, options) {
  if (!options) options = {};
  var selectors = assign({
    caption:      'bare-select > label',
    selectLabel:  'bare-select > label',
    switch:       'bare-select > input[type=checkbox]',
    dropdown:     'bare-select > ul',
    option:       'bare-select > ul > li',
    optionRadio:  'input[type=radio]',
    optionLabel:  'label',
  }, options.selectors);

  var channels = {};

   /**
    * An error has occured in the view.
    *
    * @event  view.error#error
    *
    * @type      {Object}
    * @property  {String}  message
    * @property  {String}  name
    *
    * @protected
    */
  var emitError = emit();
  channels.error = Object.freeze({
    catch: snatch(emitError),
    off: off(emitError),
  });

  var throwError = curry(emitError)('error');

  // Find and validate internal DOM.
  var getElement = getElement_({
    root: rootElement,
  });

  var elementKeys = [
    'selectLabel',
    'caption',
    'switch',
    'dropdown',
  ];

  var elementQueries = Object.freeze(asObject(
    elementKeys.map(function(key) {return {
      key: key,
      value: getElement({
        elementName: spacify(key),
        selector: selectors[key],
      })
    };})
  ));

  if (elementKeys.some(function(key) {
    if (elementQueries[key].error) {
      throwError(elementQueries[key].error);
      // TODO: At the moment this just throws through `stereo.catch`. This
      //       check will make sense when we push
      //       <https://redmine.sb12.de/issues/6877> through.
      /* istanbul ignore next */
      return true;
    }
  })) /* istanbul ignore next */ return;

  var elements = asObject(elementKeys.map(function(key) {return {
    key: key,
    value: elementQueries[key].value,
  };}));

  var optionsQuery = getOptions({
    selectors: selectors,
    getElement: getElement,
  });

  var emitUpdate = emit();
  var onUpdate = on(emitUpdate);
  channels.update = inputChannel(emitUpdate);

   /**
    * The dropdown should be folded or unfolded.
    *
    * @event  view.update#unfolded
    *
    * @type      {Object}
    * @property  {Boolean}  newValue
    *
    * @protected
    */
  onUpdate('unfolded', function(unfolded) {
    // TODO: Check if the message is valid.
    elements.switch.checked = !!unfolded.newValue;
  });
  // TODO: This should be named `folded` for consistency.

   /**
    * The select should be focused or blurred.
    *
    * @event  view.update#focused
    *
    * @type      {Object}
    * @property  {Boolean}  newValue
    *
    * @protected
    */
  onUpdate('focused', function(focused) {
    // TODO: Check if the message is valid.
    if (focused.newValue) elements.switch.focus();
    else elements.switch.blur();
  });

   /**
    * The caption’s content should be replaced with a new DOM tree.
    *
    * @event  view.update#captionContent
    *
    * @type      {Object}
    * @property  {Node}    newValue
    *
    * @protected
    */
  onUpdate('captionContent', function(captionContent) {
    // Check if the message is valid.
    var newDOM;
    if (
      !captionContent ||
      !(newDOM = captionContent.newDOM) ||
      !(typeof Node === 'function' ?
        captionContent.newDOM instanceof Node :
        captionContent.newDOM.nodeType
      )
    ) return emitError('error', error(
      'Invalid `captionContent` message on the channel `view.update`. Make ' +
      'sure you pass an `{Object} captionContent` with a ' +
      '`{Node} captionContent.newDOM`.'
    ));

    // Clear the contents of the caption.
    var lastChild;
    while ((lastChild = elements.caption.lastChild)) {
      elements.caption.removeChild(lastChild);
    }

    // Add the new content.
    elements.caption.appendChild(newDOM);
  });

   /**
    * Another option should be selected.
    *
    * @event  view.update#selection
    *
    * @type      {Object}
    * @property  {String}  newValue
    *
    * @protected
    */
  // TODO: * @property  {(String|null)}  newValue
  onUpdate('selection', function(selection) {
    // At this point we’re sure that `optionsSnapshot` is valid. Get
    // `radioNodes` out of there.
    var radioNodes = optionsSnapshot.radioNodes;

    // Uncheck all options if `""` is passed.
    var newValue = selection.newValue;
    if (newValue === '') {
      return uncheckAll(radioNodes);
    }

    // Uncheck all options and throw an error if the value can’t be found.
    var valueIndex = optionsSnapshot.values.indexOf(newValue);
    if (valueIndex === -1) {
      uncheckAll(radioNodes);
      return throwError(error('Value not found.'));
    }

    // Otherwise check the right value.
    radioNodes[valueIndex].checked = true;
  });

  // Initialize the output channel `options`.
  var emitOptions = emit();
  channels.options = Object.freeze({
    on: on(emitOptions),
    when: when(emitOptions),
    catch: snatch(emitOptions),
  });
  // TODO: `catch` -> `off`.

   /**
    * The set of options has been updated.
    *
    * At the moment options are only read and updated at initialization. Keep
    * in mind that this will change.
    *
    * @event  view.options#update
    *
    * @type      {Object}
    * @property  {Array}   values
    *   A list of option values, in the same order as in the DOM.
    * @property  {Array}   radioNodes
    *   The options’ radio button nodes, in the same order as in the DOM.
    * @property  {Array}   labelNodes
    *   The options’ label nodes, in the same order as in the DOM.
    *
    * @protected
    */
  var optionsSnapshot;
  if (optionsQuery.error) emitOptions('error', optionsQuery.error);
    // TODO: Use `view.error`.
  else {
    optionsSnapshot = optionsQuery.value;
    emitOptions('update', optionsSnapshot);
  }

   /**
    * A DOM event has occured on the switch.
    *
    * @event      view.switchElement#<domEventName>
    * @type       {DOMEvent}
    * @protected
    */
  channels.switchElement = domChannel(elements.switch);

   /**
    * A DOM event has occured on the dropdown.
    *
    * @event      view.dropdownElement#<domEventName>
    * @type       {DOMEvent}
    * @protected
    */
  channels.dropdownElement = domChannel(elements.dropdown);

   /**
    * A DOM event has occured on the select label.
    *
    * @event      view.selectLabelElement#<domEventName>
    * @type       {DOMEvent}
    * @protected
    */
  channels.selectLabelElement = domChannel(elements.selectLabel);

  // Return the channels.
  return Object.freeze(channels);
};

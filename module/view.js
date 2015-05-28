require('es6-set/implement');

var emit = require('stereo/emit');
var on = require('stereo/on');
var when = require('stereo/when');
var snatch = require('stereo/catch');
var off = require('stereo/off');
var curry = require('1-liners/curry');

var error = require('./view/error');
var uncheckAll = require('./view/uncheckAll');
var inputChannel = require('./view/inputChannel');
var getElement_ = require('./view/getElement');
var getOptions = require('./view/getOptions');

module.exports = function view(rootElement, options) {
  if (!options) options = {};
  var selectors = options.selectors || {
    caption     : 'bare-select > label',
    switch      : 'bare-select > input[type=checkbox]',
    dropdown    : 'bare-select > ul',
    option      : 'bare-select > ul > li',
    optionRadio : 'input[type=radio]',
    optionLabel : 'label',
  };

  var channels = {};

  // Initialize the `error` channel.
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

  var captionResult = getElement({
    elementName: 'caption',
    selector: selectors.caption,
  });

  if (captionResult.error) return throwError(captionResult.error);
  var captionElement = captionResult.value;

  var switchResult = getElement({
    elementName: 'switch',
    selector: selectors.switch,
  });

  if (switchResult.error) return throwError(switchResult.error);
  var switchElement = switchResult.value;

  var dropdownResult = getElement({
    elementName: 'dropdown',
    selector: selectors.dropdown,
  });

  if (dropdownResult.error) return throwError(dropdownResult.error);
  var dropdownElement = dropdownResult.value;

  var optionsResult = getOptions({
    selectors: selectors,
    getElement: getElement,
  });

  // Initialize the input channel `update`.
  var emitUpdate = emit();
  var onUpdate = on(emitUpdate);
  channels.update = inputChannel(emitUpdate);

  // Wire up `unfolded` on the `update` channel.
  onUpdate('unfolded', function(unfolded) {
    // TODO: Check if the message is valid.
    switchElement.checked = !!unfolded.newValue;
  });

  // Wire up `focused` on the `update` channel.
  onUpdate('focused', function(focused) {
    // TODO: Check if the message is valid.
    if (focused.newValue) switchElement.focus();
    else switchElement.blur();
  });

  // Wire up `captionContent` on the `update` channel.
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
    while ((lastChild = captionElement.lastChild)) {
      captionElement.removeChild(lastChild);
    }

    // Add the new content.
    captionElement.appendChild(newDOM);
  });

  // Wire up `selection` on the `update` channel.
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

  // Emit an initial `update` or `error` to `options`.
  var optionsSnapshot;
  if (optionsResult.error) emitOptions('error', optionsResult.error);
  else {
    optionsSnapshot = optionsResult.value;
    emitOptions('update', optionsSnapshot);
  }

  // Initialize the output channel `switchElement`.
  channels.switchElement = Object.freeze({
    on: switchElement.addEventListener.bind(switchElement),
  });

  // Initialize the output channel `dropdownElement`.
  channels.dropdownElement = Object.freeze({
    on: dropdownElement.addEventListener.bind(dropdownElement),
  });

  // Initialize the output channel `captionElement`.
  channels.captionElement = Object.freeze({
    on: captionElement.addEventListener.bind(captionElement),
  });

  // Return the channels.
  return Object.freeze(channels);
};

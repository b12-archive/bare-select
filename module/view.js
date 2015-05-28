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

module.exports = function view(rootElement, options) {
  if (!options) options = {};
  var selectors = assign({
    caption     : 'bare-select > label',
    selectLabel : 'bare-select > label',
    switch      : 'bare-select > input[type=checkbox]',
    dropdown    : 'bare-select > ul',
    option      : 'bare-select > ul > li',
    optionRadio : 'input[type=radio]',
    optionLabel : 'label',
  }, options.selectors);

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
      return true;
    }
  })) return;

  var elements = asObject(elementKeys.map(function(key) {return {
    key: key,
    value: elementQueries[key].value,
  };}));

  var optionsQuery = getOptions({
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
    elements.switch.checked = !!unfolded.newValue;
  });

  // Wire up `focused` on the `update` channel.
  onUpdate('focused', function(focused) {
    // TODO: Check if the message is valid.
    if (focused.newValue) elements.switch.focus();
    else elements.switch.blur();
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
    while ((lastChild = elements.caption.lastChild)) {
      elements.caption.removeChild(lastChild);
    }

    // Add the new content.
    elements.caption.appendChild(newDOM);
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
  if (optionsQuery.error) emitOptions('error', optionsQuery.error);
  else {
    optionsSnapshot = optionsQuery.value;
    emitOptions('update', optionsSnapshot);
  }

  // Initialize the output channel `switchElement`.
  channels.switchElement = domChannel(elements.switch);

  // Initialize the output channel `dropdownElement`.
  channels.dropdownElement = domChannel(elements.dropdown);

  // Initialize the output channel `selectLabelElement`.
  channels.selectLabelElement = domChannel(elements.selectLabel);

  // Return the channels.
  return Object.freeze(channels);
};

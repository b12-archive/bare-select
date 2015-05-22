require('es6-set/implement');

var emit = require('stereo/emit');
var on = require('stereo/on');
var when = require('stereo/when');
var snatch = require('stereo/catch');
var off = require('stereo/off');
var curry = require('1-liners/curry');

var error = require('./view/error');
var getDropdown = require('./view/getDropdown');
var getOptions = require('./view/getOptions');
var getSwitch = require('./view/getSwitch');
var uncheckAll = require('./view/uncheckAll');
var inputChannel = require('./view/inputChannel');

module.exports = function view(rootElement, options) {
  if (!options) options = {};
  var logger = options.logger || console;

  var channels = {};

  // Initialize the `error` channel.
  var emitError = emit();
  channels.error = Object.freeze({
    catch: snatch(emitError),
    off: off(emitError),
  });

  var throwError = curry(emitError)('error');

  // Find and validate internal DOM.
  var rootChildren = rootElement.children;

  var switchResult = getSwitch(rootChildren);
  if (switchResult.error) return throwError(switchResult.error);
  var switchElement = switchResult.value;

  var dropdownResult = getDropdown(rootChildren);
  if (dropdownResult.error) return throwError(dropdownResult.error);
  var dropdownElement = dropdownResult.value;

  var optionsResult = getOptions(dropdownElement);

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

  // Return the channels.
  return Object.freeze(channels);
};

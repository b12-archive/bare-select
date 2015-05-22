require('es6-set/implement');

var emit = require('stereo/emit');
var on = require('stereo/on');
var when = require('stereo/when');
var snatch = require('stereo/catch');
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

  // Initialize the input channel `captionContent`.
  var emitCaptionContent = emit();
  channels.captionContent = inputChannel(emitCaptionContent);

  // Initialize the input channel `unfolded`.
  var emitUnfolded = emit();
  channels.unfolded = inputChannel(emitUnfolded);

  // Wire up the channel `unfolded`.
  var onUnfolded = on(emitUnfolded);
  onUnfolded('update', function(message) {
    switchElement.checked = !!message.value;
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

  // Initialize the input channel `selection`.
  var emitSelection = emit();
  channels.selection = Object.freeze({
    emit: emitSelection,
  });

  // Wire up the channel `selection`.
  var onSelection = on(emitSelection);
  onSelection('update', function(update) {
    // At this point we’re sure that `optionsSnapshot` is valid. Get
    // `radioNodes` out of there.
    var radioNodes = optionsSnapshot.radioNodes;

    // Uncheck all options if `""` is passed.
    var newValue = update.newValue;
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

  onSelection('error', function(error) {
    // Uncheck any loaded options.
    if (optionsSnapshot) {
      uncheckAll(optionsSnapshot.radioNodes);
    }

    // Print the error’s message as a warning to the console.
    logger.warn(error.message);
  });

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

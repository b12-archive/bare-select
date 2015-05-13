require('es6-set/implement');

var øEmit = require('stereo/emit');
var øOn = require('stereo/on');
var øWhen = require('stereo/when');
var øCatch = require('stereo/catch');

var getOptions = require('./view/getOptions');
var getSwitch = require('./view/getSwitch');
var uncheckAll = require('./view/uncheckAll');

module.exports = function view(rootElement, options) {
  if (!options) options = {};
  var logger = options.logger || console;

  var channels = {};

  // Find and validate internal DOM.
  var rootChildren = rootElement.children;

  var switchResult = getSwitch(rootChildren);
  if (switchResult.error) throw switchResult.error;
    // TODO: How should we fail? Perhaps a new channel `errors`?
    // TODO: Test these.
  var switchElement = switchResult.value;

  var optionsResult = getOptions(rootChildren);

  // Initialize the input channel `captionContent`.
  channels.captionContent = Object.freeze({
    emit: øEmit(),
  });

  // Initialize the input channel `unfolded`.
  var emitUnfolded = øEmit();
  channels.unfolded = Object.freeze({
    emit: emitUnfolded,
  });

  // Wire up the channel `unfolded`.
  var onUnfolded = øOn(emitUnfolded);
  onUnfolded('update', function(message) {
    switchElement.checked = !!message.value;
  });

  // Initialize the output channel `options`.
  var emitOptions = øEmit();
  channels.options = Object.freeze({
    on: øOn(emitOptions),
    when: øWhen(emitOptions),
    catch: øCatch(emitOptions),
  });

  // Emit an initial `update` or `error` to `options`.
  var optionsSnapshot;
  if (optionsResult.error) emitOptions('error', optionsResult.error);
  else {
    optionsSnapshot = optionsResult.value;
    emitOptions('update', optionsSnapshot);
  }

  // Initialize the input channel `selection`.
  var emitSelection = øEmit();
  channels.selection = Object.freeze({
    emit: emitSelection,
  });

  // Wire up the channel `selection`.
  var onSelection = øOn(emitSelection);
  onSelection('update', function(update) {
    // Throw an error if no options have been loaded.
    if (!optionsSnapshot) throw {message:
      'No options have been loaded. Check your markup.'
    };
    var radioNodes = optionsSnapshot.radioNodes;

    // TODO: Can we trust the `update`? If not, throw an error if no value has
    //       been passed.

    // Uncheck all options if `null` is passed.
    var newValue = update.newValue;
    if (newValue === null) {
      return uncheckAll(radioNodes);
    }

    // Uncheck all options and throw an error if the value can’t be found.
    var valueIndex = optionsSnapshot.values.indexOf(newValue);
    if (valueIndex === -1) {
      uncheckAll(radioNodes);
      throw {message:
        'Value not found. Pass one of these values: [' + (
          optionsSnapshot.values
            .map(function(value) {return ('"' + value + '"');})
            .join(', ')
        ) + '].'
      };
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

  // Initialize the output channel `containerElement`.
  channels.containerElement = Object.freeze({
    on: rootElement.addEventListener.bind(rootElement),
  });

  // Initialize the error channel `error`.
  var emitError = øEmit();
  channels.error = Object.freeze({
    catch: øCatch(emitError),
  });

  // Return the channels.
  return Object.freeze(channels);
};

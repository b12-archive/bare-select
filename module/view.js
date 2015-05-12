require('es6-set/implement');

var øEmit = require('stereo/emit');
var øOn = require('stereo/on');
var øWhen = require('stereo/when');
var øCatch = require('stereo/catch');

var getOptions = require('./view/getOptions');
var getSwitch = require('./view/getSwitch');

module.exports = function view(rootElement) {
  var channels = {};

  // Find and validate internal DOM.
  var rootChildren = rootElement.children;

  var switchResult = getSwitch(rootChildren);
  if (switchResult.error) throw switchResult.error;
    // TODO: How should we fail? Perhaps a new channel `errors`?
    // TODO: Test these.
  var switchElement = switchResult.value;

  var optionsResult = getOptions(rootChildren);

  // Initialize the input channel `selection`.
  channels.selection = Object.freeze({
    emit: øEmit(),
  });

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
  if (optionsResult.error) emitOptions('error', optionsResult.error);
  else emitOptions('update', optionsResult.value);

  // Initialize the output channel `switchElement`.
  channels.switchElement = Object.freeze({
    on: switchElement.addEventListener.bind(switchElement),
  });

  // Initialize the output channel `containerElement`.
  channels.containerElement = Object.freeze({
    on: rootElement.addEventListener.bind(rootElement),
  });

  // Return the channels.
  return Object.freeze(channels);
};

require('es6-set/implement');

var øEmit = require('stereo/emit');
var øOn = require('stereo/on');
var øWhen = require('stereo/when');
var øCatch = require('stereo/catch');
var asObject = require('as/object');

function getOptions(rootChildren) {
  var dropdown = rootChildren[2];
  if (!dropdown || dropdown.tagName !== 'UL') return {error: {message:
    'bare-select: ' +
    'Dropdown element not found. The third element in a `<bare-select>` ' +
    'should be the dropdown – a `<ul>` element.'
  }};

  var options = Array.prototype.slice.call(dropdown.children)
    .filter(function(element) {return element.tagName === 'LI';})
  ;

  if (!options.length) return {error: {message: 'bare-select: ' +
    'No options found in the dropdown. Every option should be a `<li>` ' +
    'element with a radio button.'
  }};

  else if (options.some(function(item) {
    return (
      !item.children[0] ||
      item.children[0].tagName !== 'INPUT'
    );
  })) return {error: {message: 'bare-select: ' +
    'Wrong option markup. The first element in every dropdown option ' +
    '(`<li>`) should be an `<input>` element – a radio button or checkbox.'
  }};

  return {value: asObject(
    options.map(function(item) {
      return {
        key: item.children[0].value,
        value: {
          node: item,
          radioNode: item.children[0],
        },
      };
    })
  )};
}

function getSwitch(rootChildren) {
  if (
    rootChildren[1] &&
    rootChildren[1].tagName === 'INPUT' &&
    rootChildren[1].type.toLowerCase() === 'checkbox'
  ) return {value:
    rootChildren[1]
  };
  else return {error: {message: 'bare-select: ' +
    'The second element in a `<bare-select>` should be the switch – an ' +
    '`<input type="checkbox">` element.'
  }};
}

module.exports = function view(rootElement) {
  var channels = {};

  // Fond and validate internal DOM.
  var rootChildren = rootElement.children;

  var switchResult = getSwitch(rootChildren);
  if (switchResult.error) throw switchResult.error;
    // TODO: How should we fail? Perhaps a new channel `errors`?
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
  var unfoldedEmit = øEmit();
  channels.unfolded = Object.freeze({
    emit: unfoldedEmit,
  });

  // Wire up the channel `unfolded`.
  var onUnfolded = øOn(unfoldedEmit);
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

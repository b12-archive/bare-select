var emit = require('stereo/emit');
var on = require('stereo/on');
var when = require('stereo/when');
var snatch = require('stereo/catch');
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
        },
      };
    })
  )};
}

module.exports = function view(rootElement) {

  // Initialize internal DOM queries.
  var rootChildren = rootElement.children;

  // Initialize the input channel `selection`.
  var selection = Object.freeze({
    emit: emit(),
  });

  // Initialize the input channel `captionContent`.
  var captionContent = Object.freeze({
    emit: emit(),
  });

  // Initialize the input channel `unfolded`.
  var unfolded = Object.freeze({
    emit: emit(),
  });

  // Initialize the output channel `options`.
  var emitOptions = emit();
  var options = Object.freeze({
    on: on(emitOptions),
    when: when(emitOptions),
    catch: snatch(emitOptions),
  });

  // Emit an initial `update` or `error` to `options`.
  var optionsMessage = getOptions(rootChildren);
  if (optionsMessage.error) emitOptions('error', optionsMessage.error);
  else emitOptions('update', optionsMessage.value);

  // Initialize the output channel `captionElement`.
  var emitCaptionElement = emit();
  var captionElement = Object.freeze({
    on: on(emitCaptionElement),
  });

  // Return the channels.
  return Object.freeze({
    selection: selection,
    captionContent: captionContent,
    unfolded: unfolded,
    options: options,
    captionElement: captionElement,
  });
};

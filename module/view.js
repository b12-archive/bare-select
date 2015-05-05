import emit from 'stereo/emit';
import on from 'stereo/on';
import when from 'stereo/when';
import snatch from 'stereo/catch';
import asObject from 'as/object';

const getOptions = (rootChildren) => {
  const dropdown = rootChildren[2];
  if (!dropdown || dropdown.tagName !== 'UL') return {error: {message:
    'bare-select: ' +
    'The third element in a `<bare-select>` should be the dropdown – a ' +
    '`<ul>` element.'
  }};

  let options = Array.from(dropdown.children)
    .filter((element) => element.tagName === 'LI')
  ;

  if (!options.length) return {error: {message: 'bare-select: ' +
    'No options found in the dropdown. Every option should be a `<li>` ' +
    'element with a radio button.'
  }};

  else if (options.some((item) => {
    return (
      !item.children[0] ||
      item.children[0].tagName !== 'INPUT'
    );
  })) return {error: {message: 'bare-select: ' +
    'The first element in every dropdown option (`<li>`) should be an ' +
    '`<input>` element – a radio button or checkbox.'
  }};

  return {value: asObject(
    options.map((item) => {
      return {
        key: item.children[0].value,
        value: {
          node: item,
        },
      };
    })
  )};
};

export default (rootElement) => {

  // Initialize internal DOM queries.
  const rootChildren = rootElement.children;

  // Initialize the input channel `selection`.
  const selection = Object.freeze({
    emit: emit(),
  });

  // Initialize the input channel `captionContent`.
  const captionContent = Object.freeze({
    emit: emit(),
  });

  // Initialize the output channel `options`.
  const emitOptions = emit();
  const options = Object.freeze({
    on: on(emitOptions),
    when: when(emitOptions),
    catch: snatch(emitOptions),
  });

  // Emit an initial `update` or `error` to `options`.
  {
    const {error, value} = getOptions(rootChildren);
    if (error) emitOptions('error', error);
    else emitOptions('update', value);
  }

  // Initialize the output channel `captionElement`.
  const emitCaptionElement = emit();
  const captionElement = Object.freeze({
    on: on(emitCaptionElement),
  });

  // Return the channels.
  return Object.freeze({
    selection,
    captionContent,
    options,
    captionElement,
  });
};

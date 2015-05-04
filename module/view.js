import emit from 'stereo/emit';
import on from 'stereo/on';
import when from 'stereo/when';
import snatch from 'stereo/catch';

const getCaption = (rootChildren) => () => {
  if (rootChildren[0].tagName === 'LABEL') return rootChildren[0];
  else throw new Error('bare-select: ' +
    'The first element in a `<bare-select>` should be the caption – a ' +
    '`<label>` element.'
  );
};

const getSwitch = (rootChildren) => () => {
  if (
    rootChildren[1].tagName === 'INPUT' &&
    rootChildren[1].type.toLowerCase() === 'checkbox'
  ) return rootChildren[1];
  else throw new Error('bare-select: ' +
    'The second element in a `<bare-select>` should be the switch – an ' +
    '`<input type="checkbox">` element.'
  );
};

const getOptions = (rootChildren) => () => {
  if (rootChildren[2].tagName === 'UL') return rootChildren[2].children;
  else throw new Error('bare-select: ' +
    'The third element in a `<bare-select>` should be the dropdown – a ' +
    '`<ul>` element.'
  );
};

export default (rootElement) => {

  // Initialize internal DOM queries.
  const rootChildren = rootElement.children;
  const _getCaption = getCaption(rootChildren);
  const _getSwitch = getSwitch(rootChildren);
  const _getOptions = getOptions(rootChildren);

  // Initialize input/output channels.
  const selection = Object.freeze({
    emit: emit(),
  });

  const captionContent = Object.freeze({
    emit: emit(),
  });

  const emitOptions = emit();
  const options = Object.freeze({
    on: on(emitOptions),
    when: when(emitOptions),
    catch: snatch(emitOptions),
  });

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

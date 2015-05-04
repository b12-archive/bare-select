import ø from 'stereo';

export default (rootElement, settings = {}) => {
  const document = settings.document || document;

  const elements = {};

  // Scan the `rootElement` for select elements.
  const rootChildren = Array.from(rootElement.children);
  if (rootChildren[0].tagName === 'LABEL') elements.caption = rootChildren[0];
  else throw new Error('bare-select: ' +
    'The first element in a `<bare-select>` should be the caption – a ' +
    '`<label>` element.'
  );
  if (
    rootChildren[1].tagName === 'INPUT' &&
    rootChildren[1].type.toLowerCase() === 'checkbox'
  ) elements.caption = rootChildren[1];
  else throw new Error('bare-select: ' +
    'The second element in a `<bare-select>` should be the switch – an ' +
    '`<input type="checkbox">` element.'
  );
  if (rootChildren[2].tagName === 'UL') elements.dropdown = rootChildren[2];
  else throw new Error('bare-select: ' +
    'The third element in a `<bare-select>` should be the dropdown – a ' +
    '`<ul>` element.'
  );

  const selection = ø();
  const captionContent = ø();
  const options = ø();
  const captionEvents = ø();
};

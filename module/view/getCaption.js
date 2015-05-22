var error = require('./error');

module.exports = function(rootChildren) {
  var caption = rootChildren[0];

  if (
    caption &&
    caption.tagName === 'LABEL'
  ) return {value:
    caption
  };
  else return {error: error(
    'Caption element not found. The first element in a `<bare-select>` ' +
    'should be the caption – a `<label>` element. You can link it with the ' +
    'switch through the `for` attribute.'
  )};
};

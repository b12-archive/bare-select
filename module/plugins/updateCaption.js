var findIndex = require('find-index');
var arrayFrom = require('array-from');
var curry = require('1-liners/curry');
var equal = curry(require('1-liners/equal'));

var error = curry(require('../utils/error'))({
  source: 'updateCaption'
});

// TODO: Move to own file.
function getLabelByValue(options, value) {
  var values;
  var labelNodes;

  if (
    !options ||
    !Array.isArray(values = options.values) ||
    !Array.isArray(labelNodes = options.labelNodes)
  ) return {error: error(
    'Can’t get the requested label. The view hasn’t registered valid ' +
    'options. I’m expecting `{String[]} options.values` and ' +
    '`{HTMLLabelElement[]} options.labelNodes`.'
  )};

  return {value:
    options.labelNodes[
      findIndex(options.values, equal(value))
    ] ||
    null
  };
}

 /**
  * Updates content displayed in the caption to match the selected option.
  *
  * @param  {Object}       args
  * @param  {Object}       args.view
  * @param  {ø-output}     args.view.options
  * @param  {ø-input}      args.view.update
  * @param  {Object}       args.model
  * @param  {ø-output}     args.model.state
  *
  * @returns  {plugin-handle}
  *
  * @protected
  * @function
  * @module     bare-select/module/plugins/updateCaption
  */
module.exports = function (args) {
  var view = args.view;
  var model = args.model;
  var fragment = (args.documentFragment ||
    /* istanbul ignore next */
    function () {return document.createDocumentFragment();}
  );

  // Keep a snapshot of registered options.
  var optionsSnapshot = null;
  view.options.when('update', function(options) {optionsSnapshot = options;});

  // Keep a snapshot of the current selection.
  var selectionSnapshot = '';

  // Whenever the selection changes,
  model.state.when('value', function (state) {
    var value;
    if (
      !state ||
      !state.current ||
      typeof (value = state.current.value || '') !== 'string'
        // TODO: '' or null?
        // TODO: Clear caption on empty value.
    ) return view.update.emit('error', error(
      'Invalid `value` message from `model.state`. Make sure you pass a ' +
      '`state` object with `{Object} state.current`.'
    ));
      // TODO: Get rid of code duplication – this is very similar in other
      //       plugins.

    // Send the new `captionContent` to the channel `view.update` if it’s
    // different than the snapshot.
    var labelResult;
    var currentLabel;
    if (value !== selectionSnapshot) {
      labelResult = getLabelByValue(optionsSnapshot, value);
      if (labelResult.error) return view.update.emit('error', labelResult.error);
      currentLabel = labelResult.value;

      if (currentLabel) {
        // The caption’s new content is a DocumentFragment containing clones of
        // each of the label’s nodes.
        var content = fragment();
        arrayFrom(currentLabel.childNodes).forEach(function(node) {
          content.appendChild(node.cloneNode(true));
        });

        view.update.emit('captionContent', {newDOM: content});
      }
    }

    // Update the snapshot.
    selectionSnapshot = value;
  });
};

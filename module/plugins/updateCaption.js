var arrayFrom = require('array-from');
var getLabelByValue = require('./updateCaption/getLabelByValue');
var error = require('./updateCaption/error');

 /**
  * Updates content displayed in the caption to match the selected option.
  *
  * @module     {Function}  bare-select/module/plugins/updateCaption
  *
  * @returns  {pluginMaker}  updateCaptionPlugin
  */
module.exports = function (options) {
  if (!options) options = {};
  var fragment = (options.documentFragment ||
    /* istanbul ignore next */
    function () {return document.createDocumentFragment();}
  );

  return function (args) {
    var view = args.view;
    var model = args.model;

    // Keep a snapshot of registered options.
    var optionsSnapshot = null;
    view.options.when('update', function(options) {optionsSnapshot = options;});

    // Keep a snapshot of the current selection.
    var selectionSnapshot = '';

    // Whenever the selection changes,
    model.state.when('value', function (state) {
      if (!state || !state.current) return view.update.emit('error', error(
        'Invalid `value` message from `model.state`. Make sure you pass a ' +
        '`state` object with `{Object} state.current`.'
      ));

      var value = state.current.value;

      // SOON [#6904]: Clear or reset caption on empty value.

      // Send the new `captionContent` to the channel `view.update` if it’s
      // different than the snapshot.
      var labelResult;
      var currentLabel;
      if (value !== selectionSnapshot) {
        labelResult = getLabelByValue(optionsSnapshot, value);
        if (labelResult.error) return view.update.emit('error', labelResult.error);
        currentLabel = labelResult.value;

        if (currentLabel) {
          // The caption’s new content is a DocumentFragment containing clones
          // of each of the label’s nodes.
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
};

var error = require('1-liners/curry')(require('../utils/error'))({
  source: 'unfolded'
});

module.exports = function (args) {
  var view = args.view;
  var model = args.model;
  var valueSnapshot = null;

  // Update the view when the model changes.
  model.state.when('unfolded', function(state) {
    var emitUpdate = view.update.emit;

    if (!state || !state.current) return emitUpdate('error', error(
      'Invalid `unfolded` message from `model.state`. Make sure you pass an ' +
      'object with `{Object} unfolded.current`.'
    ));

    valueSnapshot = state.current.hasOwnProperty('unfolded');
    emitUpdate('unfolded', {
      newValue: valueSnapshot,
    });
  });

  // Update the model when the view changes.
  view.switchElement.on('change', function(event) {
    var emitPatch = model.patch.emit;

    if (!event || !event.target) return emitPatch('error', error(
      'Expecting a DOM event as a `change` message from `view.switchElement`.'
    ));

    var newValue = !!event.target.checked;
    if (newValue === valueSnapshot) return;

    valueSnapshot = newValue;
    emitPatch('patch', {
      unfolded: (newValue ? '' : undefined),
    });
  });
};

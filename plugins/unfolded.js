require('es6-set/implement');

var error = require('1-liners/curry')(require('../utils/error'))({
  source: 'unfolded'
});

module.exports = function (args) {
  var view = args.view;
  var model = args.model;

  // Update the view when the model changes.
  model.state.when('unfolded', function(update) {
    var emitUnfolded = view.unfolded.emit;

    if (!update.attributes) return emitUnfolded('error', error(
      'Can’t find `.attributes` in the message from the model.'
    ).message);

    emitUnfolded('update', (
      update.attributes.hasOwnProperty('unfolded') ?
      {value: true} :
      {value: false}
    ));
  });

  // Update the model when the view changes.
  var valueSnapshot = null;
  view.switchElement.on('change', function(event) {
    var emitPatch = model.patch.emit;

    if (!event.target) emitPatch('error', error(
      'Expecting a DOM event as a `change` message from `view.switchElement`.'
    ).message);

    var newValue = !!event.target.checked;

    if (newValue !== valueSnapshot) {
      emitPatch('patch', {unfolded: (newValue ?
        '' :
        undefined
      )});
      valueSnapshot = newValue;
    }
  });
};

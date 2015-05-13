require('es6-set/implement');

var error = require('1-liners/curry')(require('../utils/error'))({
  source: 'unfolded'
});

module.exports = function (args) {
  var view = args.view;
  var model = args.model;
  var logger = args.logger || console;

  // Update the view when the model changes.
  model.updates.when('unfolded', function(update) {
    if (!update.attributes) return logger.warn(error(
      'Can’t find `.attributes` in the message from the model.'
    ).message);

    view.unfolded.emit('update', (
      update.attributes.hasOwnProperty('unfolded') ?
      {value: true} :
      {value: false}
    ));
  });

  // Update the model when the view changes.
  var valueSnapshot = null;
  view.switchElement.on('change', function(event) {
    if (!event.target) return logger.warn(error(
      'Expecting a DOM event as a `change` message from `view.switchElement`.'
    ).message);

    var newValue = !!event.target.checked;

    if (newValue !== valueSnapshot) {
      model.patches.emit('apply', {unfolded: (
        newValue ?
        '' :
        undefined
      )});
      valueSnapshot = newValue;
    }
  });
};

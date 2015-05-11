require('es6-set/implement');

module.exports = function (args) {
  var view = args.view;
  var model = args.model;
  // TODO: Support `args.logger`.

  // Update the view when the model changes.
  model.updates.when('unfolded', function(state) {
    view.unfolded.emit('update', (
      state.attributes.hasOwnProperty('unfolded') ?
      {value: true} :
      {value: false}
    ));
  });

  // Update the model when the view changes.
  var valueSnapshot = null;
  view.switchElement.on('change', function(event) {
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

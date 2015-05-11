require('es6-set/implement');

module.exports = function (args) {
  var view = args.view;
  var model = args.model;
  // TODO: Support `args.logger`.

  // Update the view when the model changes.
  model.updates.when('unfolded', function(attributes) {
    view.unfolded.emit('update', (
      attributes.hasOwnProperty('unfolded') ?
      {value: true} :
      {value: false}
    ));
  });
};

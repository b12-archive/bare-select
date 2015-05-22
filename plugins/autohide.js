require('es6-set/implement');

var requestFrame = require('ainojs-requestframe');
module.exports = function (args) {

  var view = args.view;
  var model = args.model;
  var switchJustBlurred = false;
  var dropdownJustMousedowned = false;

  view.switchElement.on('blur', function() {  // WIP: Don’t use blur, or listen to mousedown on the container carefully
    switchJustBlurred = true;

    requestFrame(function () {
      if (switchJustBlurred && !dropdownJustMousedowned) {
        model.patch.emit('patch', {unfolded: undefined});
      }

      switchJustBlurred = false;
      dropdownJustMousedowned = false;
    });
  });

  view.dropdownElement.on('mousedown', function() {
    dropdownJustMousedowned = true;

    requestFrame(function() {
      requestFrame(function () {
        dropdownJustMousedowned = false;
      });
    });
  });

  view.dropdownElement.on('click', function() {
    view.update.emit('focused', {newValue: true});
  });
};

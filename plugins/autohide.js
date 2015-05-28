var requestFrame = require('ainojs-requestframe');

module.exports = function (args) {
  var view = args.view;
  var model = args.model;

  // We need a state machine here.
  var switchJustBlurred = false;
  var dropdownJustMousedowned = false;

  // Read event channels.
  var captionElement = view.captionElement;
  var dropdownElement = view.dropdownElement;
  var switchElement = view.switchElement;

  // Fold the dropdown when the switch element has been blurred.
  switchElement.on('blur', function() {

    // Update the state.
    switchJustBlurred = true;

    // Throttle the fold by one frame to make sure the blur wasn’t triggered
    // by a click within the dropdown.
    requestFrame(function () {

      // Update the model.
      if (switchJustBlurred && !dropdownJustMousedowned) {
        model.patch.emit('patch', {unfolded: undefined});
      }

      // Reset state.
      switchJustBlurred = false;
      dropdownJustMousedowned = false;
    });
  });

  // Prevent the fold when the dropdown is clicked.
  dropdownElement.on('mousedown', function() {

    // Update the state.
    dropdownJustMousedowned = true;

    // Reset the state after two frames. We need to be sure we don’t reset
    // before the fold.
    requestFrame(function() {
      requestFrame(function () {
        dropdownJustMousedowned = false;
      });
    });
  });

  // Restore focus on the switch after the dropdown has been clicked.
  dropdownElement.on('click', function() {
    view.update.emit('focused', {newValue: true});
  });

  // Don’t re-show the dropdown when the loss of focus came from flicking the
  // switch.
  captionElement.on('mousedown', function() {
    function preventDefaultOnce(event) {
      event.preventDefault();
      event.stopPropagation();
      captionElement.off('click', preventDefaultOnce);
    }

    captionElement.on('click', preventDefaultOnce);

    function unhookPreventDefaultOnce() {
      captionElement.off('click', preventDefaultOnce);
      captionElement.off('mouseleave', unhookPreventDefaultOnce);
    }

    captionElement.on('mouseleave', unhookPreventDefaultOnce);
  });
};

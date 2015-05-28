var requestFrame = require('ainojs-requestframe');

module.exports = function (args) {
  var view = args.view;
  var model = args.model;

  // We need a state machine here.
  var switchJustBlurred = false;
  var dropdownJustMousedowned = false;
  var selectJustMousedowned = false;
  var preventReshow = false;

  function resetDropdownJustMousedowned() {dropdownJustMousedowned = false;}
  function resetSelectJustMousedowned() {selectJustMousedowned = false;}

  // Read event channels.
  var selectLabelElement = view.selectLabelElement;
  var dropdownElement = view.dropdownElement;
  var switchElement = view.switchElement;

  // Fold the dropdown when the switch element has been blurred.
  switchElement.on('blur', function() {

    // Update the state.
    switchJustBlurred = true;
    if (selectJustMousedowned) preventReshow = true;

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
      requestFrame(resetDropdownJustMousedowned);
    });
  });

  // Restore focus on the switch after the dropdown has been clicked.
  dropdownElement.on('click', function() {
    view.update.emit('focused', {newValue: true});
  });

  // Don’t re-show the dropdown when the loss of focus came from flicking the
  // switch.
  selectLabelElement.on('mousedown', function() {

    // Update the state.
    selectJustMousedowned = true;
    requestFrame(resetSelectJustMousedowned);

    function preventDefaultOnce(event) {
      if (preventReshow) {
        event.preventDefault();
        selectLabelElement.off('click', preventDefaultOnce);
        preventReshow = false;
      }
    }

    selectLabelElement.on('click', preventDefaultOnce);

    function unhookPreventDefaultOnce() {
      if (preventReshow) {
        selectLabelElement.off('click', preventDefaultOnce);
        selectLabelElement.off('mouseleave', unhookPreventDefaultOnce);
        preventReshow = false;
      }
    }

    selectLabelElement.on('mouseleave', unhookPreventDefaultOnce);
  });
};

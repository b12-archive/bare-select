var requestFrame = require('ainojs-requestframe');

module.exports = function (args) {
  var view = args.view;
  var model = args.model;

  // We need a freakin’ complicated state machine here.
  var switchJustBlurred = false;
  var dropdownJustMousedowned = false;
  var selectJustMousedowned = false;
  var preventReshow = false;
  var unfoldedInThisFrame = false;

  function resetDropdownJustMousedowned() {dropdownJustMousedowned = false;}
  function resetSelectJustMousedowned() {selectJustMousedowned = false;}

  // Read event channels.
  var selectLabelElement = view.selectLabelElement;
  var dropdownElement = view.dropdownElement;
  var switchElement = view.switchElement;
  var state = model.state;

  // Watch the `unfolded` state.
  state.on('unfolded', function (state) {

    // Fail silently if the message is wrong.
    if (!state.attributes) return;

    requestFrame(
      typeof state.attributes.unfolded === 'string' ?
      function () {unfoldedInThisFrame = true;} :
      function () {unfoldedInThisFrame = false;}
    );
  });

  // Fold the dropdown after an option has been clicked.
  dropdownElement.on('click', function() {
    model.patch.emit('patch', {unfolded: undefined});
  });

  // Fold the dropdown when the switch element has been blurred.
  switchElement.on('blur', function() {

    // Update the state.
    switchJustBlurred = true;
    if (selectJustMousedowned && unfoldedInThisFrame) preventReshow = true;

    // Throttle the fold by one frame to make sure the blur wasn’t triggered
    // by a mousedown within the dropdown.
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
      if (preventReshow && !unfoldedInThisFrame) event.preventDefault();
      preventReshow = false;
      selectLabelElement.off('click', preventDefaultOnce);
    }

    selectLabelElement.on('click', preventDefaultOnce);

    function unhookPreventDefaultOnce() {
      preventReshow = false;
      selectLabelElement.off('click', preventDefaultOnce);
      selectLabelElement.off('mouseleave', unhookPreventDefaultOnce);
    }

    selectLabelElement.on('mouseleave', unhookPreventDefaultOnce);
  });
};

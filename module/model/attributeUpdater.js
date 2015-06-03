var asObject = require('as/object');
var asap = require('set-immediate-shim');
var shallowDiff = require('shallow-diff');

module.exports = function attributeUpdater(args) {

  // Read args.
  var emitter = args.emitter;
  var attributesObject = args.attributesObject;

  var executedInThisLoop = false;

  // Keep a snapshot of attributes to detect change next time.
  var attributesSnapshot = {};

  function emitUpdate() {
    // Parse current attributes.
    // SOON [#6898]: Split it out into another module.
    var attributesArray = Array.prototype.slice.call(attributesObject);
    var currentAttributes = Object.freeze(asObject(
      attributesArray.map(function (attribute) {
        return {
          key: attribute.name,
          value: attribute.value,
        };
      })
    ));

    // Diff them against the snapshot.
    var diff = shallowDiff(attributesSnapshot, currentAttributes);

    // Emit an update message. See the specs for more info.
    emitter(
      []
        .concat(diff.updated)
        .concat(diff.deleted)
        .concat(diff.added)
      ,
      Object.freeze({
        current: currentAttributes,
      })
    );

    // Update the snapshot.
    attributesSnapshot = currentAttributes;

    executedInThisLoop = false;
  }

  return function() {
    // Make sure we emit one event for batch attribute updates.
    if (executedInThisLoop) return;
    executedInThisLoop = true;

    asap(emitUpdate);
  };
};

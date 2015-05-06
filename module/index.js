var viewConstructor = require('./view');
var modelConstructor = require('./model');

var executed = false;

 /**
  * Create the element’s prototype
  *
  * @param  {Object}  [options={}]
  *   Options passed from `bareSelect`.
  *
  * @function  proto
  * @api       private
  */
function proto(options) {

  // Read options.
  if (!options) options = {};
  var plugins = (
    Array.isArray(options.plugins) && options.plugins ||
    []
  );
  var logger = options.logger || console;

  // Create the prototype.
  var result = Object.create(HTMLElement.prototype);

  // Enclose all properties within the constructor function
  result.createdCallback = function createdCallback() {

    // Initialize the `view` and `model`.
    var view = this.view = viewConstructor(this);
    var model = this.model = modelConstructor(this);

    // Add the method `registerPlugin` and register default plugins.
    var registeredPlugins = [];
    var registerPlugin = this.registerPlugin = function(plugin) {
      if (typeof plugin !== 'function') return logger.warn('bare-select: ' +
        'Can’t register plugin – it’s not a function.',
        '\nPlugin:',
        plugin
      );
      registeredPlugins.push(plugin({
        view: view,
        model: model,
        logger: logger,
      }));
    };
    plugins.forEach(registerPlugin);

    // Define a read-only property `plugins`.
    Object.defineProperty(this, 'plugins', {
      get: function() {return registeredPlugins.slice();}
    });
  };

  // Inherit `attributeChangedCallback` from the model.
  result.attributeChangedCallback = function attributeChangedCallback() {
    this.model.attributeChangedCallback.apply(null, arguments);
  };

  // Return the prototype.
  return result;
}

 /**
  * Register the <bare-select> element.
  *
  * This function should only be called once.
  *
  * @param  {Object}      [options={}]
  * @param  {Function[]}  [options.plugins=[]]
  *   Default plugins. They’ll be registered on any newly created <bare-select>
  *   element.
  * @param  {Object}      [options.logger=console]
  *   A custom logger, implementing the interface of `console`.
  * @param  {Function}    [options.logger.warn]
  * @param  {Function}    [options.logger.info]
  *
  * @module    bare-select
  * @function  default
  * @alias     bareSelect
  */
module.exports = function bareSelect(options) {
  if (!options) options = {};
  var logger = options.logger || console;

  // Only allow to register the element once.
  if (executed) return logger.warn('bare-select: ' +
    'The initialization function can only be called once.'
  );
  executed = true;

  // Register the element.
  return document.registerElement('bare-select',
    {prototype: proto(options)}
  );
};

var viewConstructor = require('./view');
var modelConstructor = require('./model');
var assign = require('object-assign');

var executed = false;

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
    var view = viewConstructor(this, options);
    var model = modelConstructor(this, options);

    // Define the method `registerPlugin` and register default plugins.
    var registeredPlugins = [];
    var pluginOptions = assign({
      view: view,
      model: model,
    }, options);

    var registerPlugin = function(plugin) {
      if (typeof plugin !== 'function') return logger.warn('bare-select: ' +
        'Can’t register plugin – it’s not a function.',
        '\nPlugin:',
        plugin
      );
      registeredPlugins.push(plugin(pluginOptions));
    };

    plugins.forEach(registerPlugin);

    // Export public properties.
    this.registerPlugin = registerPlugin;

    Object.defineProperty(this, 'plugins', {
      get: function() {return registeredPlugins.slice();}
    });

    // Export other properties.
    this._view = view;
    this._model = model;
    // TODO: this._logger = logger
    //       Plugins should use it as well. No implicit passing options around.
  };

  // Inherit `attributeChangedCallback` from the model.
  result.attributeChangedCallback = function attributeChangedCallback() {
    this._model.attributeChangedCallback.apply(null, arguments);
  };

  // Return the prototype.
  return result;
}

 /**
  * Register the <bare-select> element.
  *
  * This function should only be called once.
  *
  * @module  {Function}  bare-select
  *
  * @param  {Object}      [options={}]
  * @param  {Function[]}  [options.plugins=[]]
  *   Default plugins. They’ll be registered on any newly created <bare-select>
  *   element.
  * @param  {Object}      [options.logger=console]
  *   A custom logger, implementing the interface of `console`.
  * @param  {Function}    [options.logger.warn]
  * @param  {Function}    [options.logger.info]
  */
// TODO: This is very much out of date.
module.exports = function(options) {
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

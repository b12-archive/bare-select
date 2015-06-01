var executed = false;

function proto(options) {

  // Read options.
  var pluginMakers = (Array.isArray(options.plugins) && options.plugins) || [
    require('./plugins/keyboardNavigation')(),
    require('./plugins/mouseNavigation')(),
    require('./plugins/unfolded')(),
    require('./plugins/updateCaption')(),
    require('./plugins/value')(),
  ];

  var logger = options.logger || console;
  var modelMaker = options.model || require('./model')();
  var viewMaker = options.view || require('./view')();


  // Create the prototype.
  var result = Object.create(HTMLElement.prototype);

   /**
    * @class  HTMLBareSelectElement
    *
    * @property  {Function}  registerPlugin(plugin)
    *   Pass a configured plugin to register it on a single `<bare-select>`
    *   element.
    * @property  {Array}     plugins
    *   *[read-only]* A list of registered plugin handles.
    */
  result.createdCallback = function createdCallback() {

    // Initialize the `model` and `view`.
    var modelViewOptions = {root: this, logger: logger};
    var model = modelMaker(modelViewOptions);
    var view = viewMaker(modelViewOptions);

    // Define the method `registerPlugin` and register default plugins.
    var plugins = [];
    var pluginOptions = {view: view, model: model, logger: logger};

    var registerPlugin = function(plugin) {
      if (typeof plugin !== 'function') return logger.warn('bare-select: ' +
        'Can’t register plugin – it’s not a function.',
        '\nPlugin:',
        plugin
      );
      plugins.push(plugin(pluginOptions));
    };

    pluginMakers.forEach(registerPlugin);

    // Export public properties.
    this.registerPlugin = registerPlugin;

    Object.defineProperty(this, 'plugins', {
      get: function() {return plugins.slice();}
    });

    // Export other properties.
    this._view = view;
    this._model = model;
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
  * @param  {Object}
  *   [options={}]
  * @param  {view-maker}
  *   [options.view=require('bare-select/module/view')()]
  * @param  {model-maker}
  *   [options.model=require('bare-select/module/model')()]
  * @param  {plugin-maker[]}
  *   [options.plugins=[require('bare-select/module/plugins/keyboardNavigation')(), require('bare-select/module/plugins/mouseNavigation')(), require('bare-select/module/plugins/unfolded')(), require('bare-select/module/plugins/updateCaption')(), require('bare-select/module/plugins/value')()]]
  *   Default plugins. They’ll be registered on any newly created <bare-select>
  *   element.
  *
  * @param  {logger}
  *   [options.logger=console]
  *   A custom logger. Make sure `logger.info` and `logger.warn` are functions.
  *
  * @returns  {HTMLBareSelectElement}
  */
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

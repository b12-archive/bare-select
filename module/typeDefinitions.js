 /**
  * An input channel. `emit` events to pass information to the subject. If
  * you emit an `'error'` event it will be thrown, unless you’ve subscribed
  * a listener through `catch`. See <http://npm.im/stereo> for details.
  *
  * @typedef    stereoInput
  * @protected
  *
  * @type      {Object}
  * @property  {Function}  emit
  * @property  {Function}  catch
  */

 /**
  * An output channel. Subscribe through `on` to get all upcoming events.
  * Subscribe through `when` to get the last event issued in the past as
  * well. Unsubscribe through `off`. See <http://npm.im/stereo> for details.
  *
  * @typedef    stereoPromiseLikeOutput
  * @protected
  *
  * @type      {Object}
  * @property  {Function}  on
  * @property  {Function}  when
  * @property  {Function}  off
  */

 /**
  * An DOM proxy channel. `on` is a proxy to `addEventListener` on a DOM
  * element. `off` is a proxy to `removeEventListener`.
  *
  * @typedef    stereoDomProxy
  * @protected
  *
  * @type      {Object}
  * @property  {Function}  on
  * @property  {Function}  off
  */

 /**
  * An error channel. If you subscribe to it through `catch`, `'error'` event
  * data will be passed to your listener instead of being thrown. Unsubscribe
  * through `off`. See <http://npm.im/stereo> for details.
  *
  * @typedef    stereoError
  * @protected
  *
  * @type      {Object}
  * @property  {Function}  catch
  * @property  {Function}  off
  */
// SOON (https://github.com/tomekwi/stereo/issues/13): Unsubscribe through `uncatch`.

 /**
  * @typedef    viewMaker
  * @protected
  *
  * @type     {Function}
  * @param    {Object}       args
  * @param    {HTMLElement}  args.root
  * @returns  {view}
  */

 /**
  * @typedef    view
  * @protected
  *
  * @type      {Object}
  * @property  {stereoInput}              update
  * @property  {stereoPromiseLikeOutput}  options
  * @property  {stereoDomProxy}           switchElement
  * @property  {stereoDomProxy}           dropdownElement
  * @property  {stereoDomProxy}           selectLabelElement
  * @property  {stereoError}              options
  *
  * @listens  view.update#unfolded
  * @listens  view.update#focused
  * @listens  view.update#captionContent
  * @listens  view.update#selection
  * @fires    view.error#error
  * @fires    view.options#update
  * @fires    view.switchElement#(domEventName)
  * @fires    view.dropdownElement#(domEventName)
  * @fires    view.selectLabelElement#(domEventName)
  */
 // SOON [#6900]:
 // * @property  {String}  version
 // *   The exact string `'0'`

 /**
  * @typedef    modelMaker
  * @protected
  *
  * @type     {Function}
  * @param    {Object}       args
  * @param    {HTMLElement}  args.root
  * @returns  {model}
  */

 /**
  * @typedef    model
  * @protected
  *
  * @type      {Object}
  * @property  {stereoInput}   patch
  * @property  {stereoOutput}  state
  * @property  {Function}      attributeChangedCallback
  *
  * @listens  model.patch#patch
  * @listens  model.patch#error
  * @fires    model.state#(attributeName)
  */
 // SOON [#6900]:
 // * @property  {String}  version
 // *   The exact string `'0'`

 /**
  * @typedef    pluginMaker
  * @protected
  *
  * @type     {Function}
  * @param    {Object}    args
  * @param    {view}      args.view
  * @param    {model}     args.model
  * @returns  {plugin}
  */

 /**
  * @typedef    plugin
  * @protected
  *
  * @type  {undefined}
  */
 // SOON [#6900]:
 // * @type      {Object}
 // * @property  {String}  version
 // *   The exact string `'0'`
 // SOON [#6881]:
 // * @property  {Function}  unplug

 /**
  * @typedef    logger
  * @protected
  *
  * @type      {Object}
  * @property  {Function}  info
  * @property  {Function}  warn
  */

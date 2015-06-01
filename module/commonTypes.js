 /**
  * @typedef      ø-input
  * @description
  *   An input channel. `emit` events to pass information to the subject. If
  *   you emit an `'error'` event it will be thrown, unless you’ve subscribed
  *   a listener through `catch`. See <http://npm.im/stereo> for details.
  *
  * @type      {Object}
  * @property  {Function}  emit
  * @property  {Function}  catch
  *
  * @protected
  */

 /**
  * @typedef      ø-promise-like-output
  * @description
  *   An output channel. Subscribe through `on` to get all upcoming events.
  *   Subscribe through `when` to get the last event issued in the past as
  *   well. Unsubscribe through `off`. See <http://npm.im/stereo> for details.
  *
  * @type      {Object}
  * @property  {Function}  on
  * @property  {Function}  when
  * @property  {Function}  off
  *
  * @protected
  */

 /**
  * @typedef      ø-DOM-proxy
  * @description
  *   An DOM proxy channel. `on` is a proxy to `addEventListener` on a DOM
  *   element. `off` is a proxy to `removeEventListener`.
  *
  * @type      {Object}
  * @property  {Function}  on
  * @property  {Function}  off
  *
  * @protected
  */

 /**
  * @typedef      ø-error
  * @description
  *   An error channel. If you subscribe to it through `catch`, `'error'` event
  *   data will be passed to your listener instead of being thrown. Unsubscribe
  *   through `off`. See <http://npm.im/stereo> for details.
  *
  * @type      {Object}
  * @property  {Function}  catch
  * @property  {Function}  off
  *
  * @protected
  */
// TODO: Unsubscribe through `uncatch`.

 /**
  * @typedef  plugin-handle
  * @type     {undefined}
  *
  * @protected
  */
 // TODO: * @type      {Object}
 //       * @property  {Function}  unplug


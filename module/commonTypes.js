 /**
  * An input channel. `emit` events to pass information to the subject. If
  * you emit an `'error'` event it will be thrown, unless you’ve subscribed
  * a listener through `catch`. See <http://npm.im/stereo> for details.
  *
  * @typedef    ø-input
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
  * @typedef    ø-promise-like-output
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
  * @typedef    ø-DOM-proxy
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
  * @typedef    ø-error
  * @protected
  *
  * @type      {Object}
  * @property  {Function}  catch
  * @property  {Function}  off
  */
// TODO: Unsubscribe through `uncatch`.

 /**
  * @typedef    plugin-handle
  * @protected
  *
  * @type  {undefined}
  */
 // TODO: * @type      {Object}
 //       * @property  {Function}  unplug


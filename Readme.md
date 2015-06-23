[![Coveralls – test coverage
](https://img.shields.io/coveralls/studio-b12/bare-select.svg?style=flat-square)
](https://coveralls.io/r/studio-b12/bare-select)
 [![Travis – build status
](https://img.shields.io/travis/studio-b12/bare-select/master.svg?style=flat-square)
](https://travis-ci.org/studio-b12/bare-select)
 [![David – status of dependencies
](https://img.shields.io/david/studio-b12/bare-select.svg?style=flat-square)
](https://david-dm.org/studio-b12/bare-select)
 [![Code style: airbnb
](https://img.shields.io/badge/code%20style-airbnb-blue.svg?style=flat-square)
](https://github.com/airbnb/javascript)
 [![Stability: experimental
](https://img.shields.io/badge/stability-experimental-red.svg?style=flat-square)
](https://nodejs.org/api/documentation.html#documentation_stability_index)




&lt;bare-select&gt;
===================

**An ultra-stylable replacement for &lt;select&gt;.**

* [Dead-easy to style][]. Just match it to your design.
* Usable without JavaScript. [Here’s why we care][].
* Mimicks the native `<select>`. Keyboard navigation included.
* Event-driven and plugin-based. Hackable from head to toe.

[Here’s why we care]:  http://aaronmbushnell.com/lets-stop-customizing-form-fields/  "Let's stop customizing form fields"
[Dead-easy to style]:  ./dev/null  "Work in progress…"




Installation
------------

```sh
$ npm install git@git.sb12.de:js/lib/bare-select
$ cd node_modules/bare-select
$ npm install
$ npm run prepublish
```


Once we’ve published to <http://npmjs.org>, it’ll be a lot easier:

```sh
$ npm install bare-select
```




Usage
-----

You’ll likely be fine with the default settings. Just execute this to register the `<bare-select>`:

```js
require('bare-select')();
```


Then prepare your markup:

```html
<bare-select>             <!-- • The custom element.                         -->
  <label></label>         <!-- • A `<label>` for the switch. A click on this -->
                          <!--   element will unfold the dropdown.           -->
                          <!-- • The caption of the select box. It’s the     -->
                          <!--   same element as the label unless you        -->
                          <!--   configure it otherwise.                     -->
  <input type=checkbox>   <!-- • The switch. Controls the visibility of the  -->
                          <!--   dropdown.                                   -->
  <ul>                    <!-- • The dropdown. Folds and unfolds.            -->
    <li>                  <!-- • An option. You can have zero or more.       -->
      <input type=radio>  <!-- • The option’s radio. Its `value` is the      -->
                          <!--   value of the option. When it’s checked, the -->
                          <!--   option is selected.                         -->
      <label></label>     <!-- • The content of the option. What the user    -->
    </li>                 <!--   sees.                                       -->
  </ul>
</bare-select>
```


Looks complicated? How about an example:

```html
<bare-select unfolded>
  <label>Pick a number</label>
  <input type="checkbox" />
  <ul>
    <li><input type="radio" value="1" /><label>
      One
    </label></li>
    <li><input type="radio" value="2" /><label>
      Two
    </label></li>
    <li><input type="radio" value="3" /><label>
      Three
    </label></li>
  </ul>
</bare-select>
```


Now try taking the `unfolded` off your `<bare-select>`. Try setting `value="2"` on it.




Configuring
-----------

<!-- @doxie.inject start public -->
*Work in progress…*
<!-- @doxie.inject end public -->




Hacking
-------

Our event-driven design means that every feature is a plugin. Plugins are the glue between the view and model.

You can easily add, remove, fork and modify plugins to suit them to your needs. You can even replace the view and the model with your own custom implementations.

<!-- @doxie.inject start protected -->
*Work in progress…*
<!-- @doxie.inject end protected -->




License
-------

[MIT][] © [Studio B12 GmbH][]

[MIT]: ./License.md
[Studio B12 GmbH]: https://github.com/studio-b12

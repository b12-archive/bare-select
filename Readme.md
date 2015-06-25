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
<!-- Don’t remove or change the comment above – that can break automatic updates. -->
###  HTMLBareSelectElement  ###




###  {Function} bare-select  ###

Register the <bare-select> element.

This function should only be called once.

**Parameters:**

* **`options`**  
  <sup>type: `Object`&ensp;|&ensp;default: `{}`&ensp;|&ensp;optional</sup>

* **`options.view`**  
  <sup>type: `viewMaker`&ensp;|&ensp;default: `require('bare-select/module/view')()`&ensp;|&ensp;optional</sup>

* **`options.model`**  
  <sup>type: `modelMaker`&ensp;|&ensp;default: `require('bare-select/module/model')()`&ensp;|&ensp;optional</sup>

* **`options.plugins`**  
  <sup>type: `pluginMaker[]`&ensp;|&ensp;default: `[require('bare-select/module/plugins/keyboardNavigation')(), require('bare-select/module/plugins/mouseNavigation')(), require('bare-select/module/plugins/unfolded')(), require('bare-select/module/plugins/updateCaption')(), require('bare-select/module/plugins/value')()]`&ensp;|&ensp;optional</sup>  
  Default plugins. They’ll be registered on any newly created <bare-select>

* **`options.logger`**  
  <sup>type: `logger`&ensp;|&ensp;default: `console`&ensp;|&ensp;optional</sup>  
  A custom logger. Make sure `logger.info` and `logger.warn` are functions.


###  {Function} bare-select/module/model  ###

A model based on a custom element.

The state of the model is stored as attributes on a custom element.
Changing an attribute will update the model, and patching the model’s state
will update the attribute.


###  {Function} bare-select/module/view  ###

A pure HTML+CSS view.

Have a look at <../Readme.md> to see an example of the markup.

**Parameters:**

* **`options`**  
  <sup>type: `Object`&ensp;|&ensp;&ensp;|&ensp;required</sup>

* **`options.selectors`**  
  <sup>type: `Object`&ensp;|&ensp;&ensp;|&ensp;required</sup>

* **`options.selectors.caption`**  
  <sup>type: `String`&ensp;|&ensp;default: `'bare-select > label'`&ensp;|&ensp;optional</sup>

* **`options.selectors.selectLabel`**  
  <sup>type: `String`&ensp;|&ensp;default: `'bare-select > label'`&ensp;|&ensp;optional</sup>

* **`options.selectors.switch`**  
  <sup>type: `String`&ensp;|&ensp;default: `'bare-select > input[type=checkbox]'`&ensp;|&ensp;optional</sup>

* **`options.selectors.dropdown`**  
  <sup>type: `String`&ensp;|&ensp;default: `'bare-select > ul'`&ensp;|&ensp;optional</sup>

* **`options.selectors.option`**  
  <sup>type: `String`&ensp;|&ensp;default: `'bare-select > ul > li'`&ensp;|&ensp;optional</sup>

* **`options.selectors.optionRadio`**  
  <sup>type: `String`&ensp;|&ensp;default: `'input[type=radio]'`&ensp;|&ensp;optional</sup>

* **`options.selectors.optionLabel`**  
  <sup>type: `String`&ensp;|&ensp;default: `'label'`&ensp;|&ensp;optional</sup>


###  {Function} bare-select/module/plugins/keyboardNavigation  ###

Great keyboard navigation.


###  {Function} bare-select/module/plugins/mouseNavigation  ###

Great mouse navigation.


###  {Function} bare-select/module/plugins/unfolded  ###

Adds support for the attribute `unfolded`. Adding the attribute to the
`<bare-select>` will unfold the select – and removing the attribute will
fold it.


###  {Function} bare-select/module/plugins/updateCaption  ###

Updates content displayed in the caption to match the selected option.


###  {Function} bare-select/module/plugins/value  ###

Adds support for the attribute `value`. Changing the selection will update
the attribute `value` within the `<bare-select>`. Changing the attribute
will update the selection.


<!-- Don’t remove or change the comment below – that can break automatic updates. More info at <http://npm.im/doxie.inject>. -->
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

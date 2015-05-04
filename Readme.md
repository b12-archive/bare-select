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

**A stylable replacement for &lt;select&gt;.**  
**Scripts from us.**  
**Styles by you.**




Installation
------------

```sh
$ npm install git@git.sb12.de:js/lib/bare-select
$ cd node_modules/bare-select
$ npm install
$ npm run prepublish
```


Once we’ve published to npmjs.org it’ll be a lot easier:

```sh
$ npm install bare-select
```




Usage
-----

…




This is quality code
--------------------

Here’s what we ship:

- The behavior of the native &lt;select&gt; mimicked as closely as possible.

- Keyboard navigation is a pleasure.

- Super-extendable. Every feature is a plugin.

- Works without JavaScript – here’s why:
  - you can extend or replace this script without breaking anything
  - it works before the page fully loads
  - there’s no magical DOM manipulation




Plugins
-------

We leverage the decoupled Model-Plugins-View architecture. Every feature is a plugin. You can also easily write your own.

Models:
  - Custom element

Views:
  - Pure CSS

Plugins:
  - `value` synchronization
  - `unfolded` option
  - Update the select caption
  - Keyboard navigation
  - Hide on exit
  - Hide on selection


**Extras:** We’ll build these in if we have the time. PRs are also very welcome.

Alternative models:
  + Pure JavaScript API

Alternative views:
  + Shadow DOM
  + Hidden select variation

Plugins:
  + `disabled` option
  + Quick mousedown-hover-release selection (as in Mac OS X or GNOME)
  + Select on mousedown, hide on mouseup
  + DOM events
  + Fuzzy text search




License
-------

[MIT][] © [Studio B12 GmbH][]

[MIT]: ./License.md
[Studio B12 GmbH]: https://github.com/studio-b12

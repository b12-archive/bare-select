var compose = require('1-liners/compose');
var not = require('1-liners/not');
var isFalsy = require('1-liners/isFalsy');
var curry = require('1-liners/curry');
var match = require('1-liners/match');

var parseParam = curry(match)(new RegExp(
  '(?:\\{(.+)\\})?' + '\\s*' +          // (1) Type
  '(?:' +
    '([\\w\\.]+)' + '|' +               // (2) Required parameter
    '\\[' +
      '([\\w\\.]+)=' +                  // (3) Optional parameter
      '((?:[^\\[]|(?:\\[.*?\\]))+?)' +  // (4) Default value
    '\\]' +
  ')?' + '\\s*' +
  '(.*)'                                // (5) Description
));
  // Fix until https://github.com/tj/dox/issues/173 and
  // https://github.com/tj/dox/issues/172

var parsePath = curry(match)(/\{Function\}\s*(.*)/);
var parseName = curry(match)(/([^\/\s]*)\s*$/);

var renderParam = function (tag, options) {
  if (!options) options = {};

  var string = tag.string;
  var data = parseParam(string);

  return (
    ('* **`' + (
      (data && (data[2] || data[3])) ||
      string
    ).trim().replace(/\s/g, ' ') + '`**') +

    ('  \n  <sup>' + [
      (data[1] && 'type: `' + data[1] + '`'),
      (data[4] && 'default: `' + data[4] + '`'),
      (options.returnValue ?
        null :
        (data[2] ? 'required' : 'optional')
      ),
    ].filter(compose(isFalsy, not)).join('&ensp;|&ensp;') + '</sup>') +

    (data[5] ? '  \n  ' + data[5] : '') +

    '\n'
  );
};

module.exports = function (doc) {
  var data = doc.data;
  if (!data) return null;

  var tags = {};
  var params = [];
  data.tags.forEach(function (tag) {
    if (tag.type === 'param') params.push(tag);
    else tags[tag.type] = tag;
  });

  var module = tags.module;
  var pathResult;
  if (!module || !(pathResult = parsePath(module.string))) {
    console.warn('Skipping a comment. We only support function modules.');
    return null;
  }

  var path = pathResult[1];
  var name = parseName(path)[1];

  var returns = tags.returns;

  return (
    '\n' +
    '&nbsp;\n' +
    '\n' +
    '<h3><pre>\n' +
    name + '()\n' +
    '  → ' + parseParam(returns.string)[2] + '\n' +
    '</pre></h3>\n' +
    '\n' +
    data.description.full + '\n' +
    '\n' +
    '**Importing:** `var ' + name + ' = require(\'' + path + '\')`\n' +
    '\n' +
    '**Parameters:**\n' +
    '\n' +
    (params.length ?
      params.map(renderParam).join('\n') :
      'None.\n'
    ) +
    '\n' +
    '**Return value:**\n' +
    '\n' +
    renderParam(returns, {returnValue: true}) +
    '\n'
  );
};

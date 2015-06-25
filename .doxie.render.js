var isTruthy = require('1-liners/isTruthy');
var curry = require('1-liners/curry');
var match = require('1-liners/match');
var camelize = require('camelize-identifier');

var paramData = new RegExp(
  '(?:\\{(.+?)\\})?' + '\\s*' +          // (1) Type
  '(?:' +
    '([\\w\\.]+)' + '|' +               // (2) Required parameter
    '\\[' +
      '([\\w\\.]+)=' +                  // (3) Optional parameter
      '((?:[^\\[]|(?:\\[.*?\\]))+?)' +  // (4) Default value
    '\\]' +
  ')?' + '\\s*' +
  '(.*)'                                // (5) Description
);
  // Fix until https://github.com/tj/dox/issues/173 and
  // https://github.com/tj/dox/issues/172

var parseParam = function (param) {
  var string = param.string;
  var data = string.match(paramData);

  return {
    string: string,
    data: data,
    required: !!data[3],
    name: (
      (data && (data[2] || data[3])) ||
      string
    ).trim(),
  };
};

var parsePath = curry(match)(/\{Function\}\s*(.*)/);
var parseName = curry(match)(/([^\/\s]*)\s*$/);

var renderParam = function (param, options) {
  if (!options) options = {};

  var data = param.data;

  return (
    ('* **`' + param.name + '`**') +

    ('  \n  <sup>' + [
      (data[1] && 'type: `' + data[1] + '`'),
      (data[4] && 'default: `' + data[4] + '`'),
      (options.returnValue ?
        null :
        (data[2] ? 'required' : 'optional')
      ),
    ].filter(isTruthy).join('&ensp;|&ensp;') + '</sup>') +

    (data[5] ? '  \n  ' + data[5] : '') +

    '\n'
  );
};

var renderArgument = function(param) {
  var name = param.name.replace(/^options\./, '');
  if (name.indexOf('.') !== -1) return null;

  return (param.required ?
    ('[' + name + ']') :
    name
  );
};

var renderArguments = function(params) {
  return params.map(renderArgument).filter(isTruthy).join(', ');
};

module.exports = function (doc) {
  var data = doc.data;
  if (!data) return null;

  var tags = {};
  var params = [];
  data.tags.forEach(function (tag) {
    if (tag.type === 'param') params.push(parseParam(tag));
    else tags[tag.type] = tag;
  });

  var module = tags.module;
  var pathResult;
  if (!module || !(pathResult = parsePath(module.string))) {
    console.warn('Skipping a comment. We only support function modules.');
    return null;
  }

  var path = pathResult[1];
  var name = camelize(parseName(path)[1]);

  var returns = parseParam(tags.returns);

  return (
    '\n' +
    '&nbsp;\n' +
    '\n' +
    '<h3><pre>\n' +
    name + '(' + (
      (params[0] && params[0].name === 'options') ?
      ('[{' +
        renderArguments(params.slice(1)) +
      '}]') :
      renderArguments(params)
    ) + ')\n' +
    '  → ' + returns.name + '\n' +
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

var compose = require('1-liners/compose');
var not = require('1-liners/not');
var isFalsy = require('1-liners/isFalsy');

var paramParser = new RegExp(
  '(?:\\{(.+)\\})?' + '\\s*' +          // (1) Type
  '(?:' +
    '([\\w\\.]+)' + '|' +               // (2) Required parameter
    '\\[' +
      '([\\w\\.]+)=' +                  // (3) Optional parameter
      '((?:[^\\[]|(?:\\[.*?\\]))+?)' +  // (4) Default value
    '\\]' +
  ')' + '\\s*' +
  '(.*)'                                // (5) Description
);
  // Fix until https://github.com/tj/dox/issues/173 and
  // https://github.com/tj/dox/issues/172

module.exports = function (doc) {
  var data = doc.data;
  if (!data) return null;

  var tags = {};
  var params = [];
  data.tags.forEach(function (tag) {
    if (tag.type === 'param') params.push(tag);
    else tags[tag.type] = tag;
  });

  return (
    '###  ' + (tags.module || tags.class).string + '  ###\n' +
    '\n' +
    data.description.full + '\n' +
    '\n' +
    (params.length ? (
      '**Parameters:**\n' +
      '\n' +
      params.map(function (param) {
        var string = param.string;
        var data = string.match(paramParser);

        return (
          ('* **`' + (data ?
            (data[2] || data[3]) :
            string
          ).trim().replace(/\s/g, ' ') + '`**') +

          ('  \n  <sup>' + [
            (data[1] && 'type: `' + data[1] + '`'),
            (data[4] && 'default: `' + data[4] + '`'),
            (data[2] ? 'required' : 'optional'),
          ].filter(compose(isFalsy, not)).join('&ensp;|&ensp;') + '</sup>') +

          (data[5] ? '  \n  ' + data[5] : '')
        );
      }).join('\n\n') + '\n' +
      '\n'
    ) : '') +
    '\n'
  );
};

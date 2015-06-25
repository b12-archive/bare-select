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

        return [
          ('* **`' + (data ?
            (data[2] || data[3]) :
            string
          ).trim().replace(/\s/g, ' ') + '`**'),

          ('  <sup>' + [
            (data[1] ? 'type: `' + data[1] + '`' : undefined),
            (data[4] ? 'default: `' + data[4] + '`' : undefined),
            (typeof data[2] === 'undefined' ? 'optional' : 'required'),
          ].join('&ensp;|&ensp;') + '</sup>'),

          (data[5] ? '  ' + data[5] : undefined)
        ].join('  \n');
      }).join('\n\n') + '\n' +
      '\n'
    ) : '') +
    '\n'
  );
};

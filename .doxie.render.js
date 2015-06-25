var find = require('array-find');

module.exports = function (doc) {
  if (!doc.data) return null;

  var title = find(doc.data.tags, function (tag) {
    return (tag.type === 'module' || tag.type === 'class');
  }).string;

  return '###  ' + title + '  ###\n\n';
};

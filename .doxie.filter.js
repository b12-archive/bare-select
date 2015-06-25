module.exports = function (doc) {
  var tags;

  return (
    doc.data &&
    Array.isArray(tags = doc.data.tags) &&
    tags.length &&
    tags.every(function (tag) {
      var type = tag.type;
      return (type !== 'private' && type !== 'protected');
    })
  );
};

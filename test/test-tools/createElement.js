var jsdom = require('jsdom').jsdom;
var curryRight = require('1-liners/curryRight2');

module.exports = curryRight(require('virtual-dom/create-element'))(
  {document: (
    (typeof window !== 'undefined' && window.document) ||
    jsdom().defaultView.document
  )}
);

var test = require('../test-tools/test')('“updateCaption” plugin');
var mockPlugin = require('../test-tools/mockPlugin');
var createElement = require('../test-tools/createElement');
var h = require('virtual-dom/h');

var updateCaption = require('../../plugins/updateCaption');

test(
  'Updates `captionContent` on the channel `view.update`',
  function(is) {
    is.plan(0);

    // Prepare a mock select.
    var mock = mockPlugin(updateCaption);
    var mockItems = [
      createElement(h('label')),
      createElement(h('label')),
    ];

    mock.view.options.emit('update', {
      values: ['0', '1'],
      items: mockItems,
    });

    var mockContent = createElement(h('div'));
    mockItems[0].cloneNode = function(deep) {
      is.equal(
        deep,
        true,
        'clones the content'
      );

      // WIP. Not so easy.
    };
    mock.model.state.emit('value', {attributes: {value: '0'}});

    is.end();
  }
);

var test = require('../test-tools/test')('“updateCaption” plugin');
var mockPlugin = require('../test-tools/mockPlugin');
var always = require('1-liners/always');

var updateCaption = require('../../plugins/updateCaption');

test(
  'Updates `captionContent` on the channel `view.update`',
  function(is) {
    is.plan(5);

    // Prepare a mock subset of the DOM.
    var mockFragment = {
      appendChild: function (child) {is.equal(
        child,
        'mock content',
        'adds the cloned content to a new DocumentFragment'
      );},
    };

    var mock = mockPlugin(updateCaption,
      {DocumentFragment: always(mockFragment)}
    );

    var mockItems = [
      null,
      {childNodes: [
        {cloneNode: function(deep) {
          is.pass(
            'finds the right option by the `value` message from `model.state`'
          );

          is.equal(
            deep,
            true,
            'clones its content deeply'
          );

          return 'mock content';
        }}
      ]},
    ];

    mock.view.options.emit('update', {
      values: ['a', 'b'],
      labelNodes: mockItems,
    });
    mock.model.state.emit('value', {attributes: {value: 'b'}});

    mock.view.update.when('captionContent', function (captionContent) {
      is.equal(
        captionContent.newDOM,
        mockFragment,
        'updates `captionContent` on `view.update` with the new ' +
        'DocumentFragment'
      );
    });

    is.doesNotThrow(
      function () {
        mock.model.state.emit('value', {attributes: {value: 'invalid'}});
      },
      'fails silently when given an invalid value'
    );
  }
);

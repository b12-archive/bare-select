var test = require('../test-tools/test')('“updateCaption” plugin');
var mockPlugin = require('../test-tools/mockPlugin');
var doc = require('jsdom').jsdom().defaultView.document;
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

test(
  'Fails gracefully.',
  function (is) {
    is.plan(2);

    // Prepare a mock select, without any attributes.
    var mock = mockPlugin(updateCaption,
      {DocumentFragment: always(doc.createDocumentFragment())}
    );

    // Emit a `value` before any options have been loaded.
    mock.view.update.catch(function(error) {is.ok(
      error.message.match(/the view hasn’t registered valid options/i),
      'when no options have been registered'
    );});

    mock.model.state.emit('value', {attributes: {value: 'a'}});
    mock.view.update.off('error');

    // Emit an invalid `value` message.
    mock.view.update.catch(function(error) {is.ok(
      error.message.match(/invalid `value` message/i),
      'when passed an invalid `value` message from `model.state`'
    );});

    mock.model.state.emit('value', new Date());
    mock.view.update.off('error');

    // Emit an unknown `value`.
    mock.view.update.on(['captionContent', 'error'], function(e) {console.log(e); is.fail(
      'fails silently when passed an unknown `value`'
    );});

    mock.view.options.emit('update', {
      values: ['a', 'b'],
      labelNodes: [null, null],
    });
    mock.model.state.emit('value', {attributes: {value: 'unknown'}});
    mock.view.update.off(['captionContent', 'error']);

    is.end();
  }
);

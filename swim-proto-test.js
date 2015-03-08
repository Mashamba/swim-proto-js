'use strict';
/* global describe: false */
/* global it: false */

var assert = require('assert');
var recon = require('recon-js');
var proto = require('./swim-proto.js');

assert.same = function (x, y) {
  if (!recon.compare(x, y))
    assert.fail(false, true, recon.stringify(x) +' did not equal '+ recon.stringify(y));
};


describe('Envelope decoder', function () {
  it('should parse and decode recon strings', function () {
    var envelope = proto.decode('@event @node("house#kitchen") @lane("light/on")');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'house#kitchen');
    assert.same(envelope.lane, 'light/on');
    assert.same(envelope.body, recon.empty());
  });
});


describe('@event message', function () {
  it('should have required properties', function () {
    var envelope = new proto.EventMessage(undefined, undefined, 'node_uri', 'lane_uri');
    assert(envelope.isEventMessage);
    assert.same(envelope.channel, recon.extant);
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should encode recon with empty body', function () {
    var envelope = new proto.EventMessage(1, 'via_uri', 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@event(1) @via(via_uri) @node(node_uri) @lane(lane_uri)'));

    envelope = new proto.EventMessage(undefined, undefined, 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@event @node(node_uri) @lane(lane_uri)'));
  });

  it('should encode recon with non-empty body', function () {
    var envelope = new proto.EventMessage(1, 'via_uri', 'node_uri', 'lane_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@event(1) @via(via_uri) @node(node_uri) @lane(lane_uri) {a:1,foo}'));

    envelope = new proto.EventMessage(undefined, undefined, 'node_uri', 'lane_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@event @node(node_uri) @lane(lane_uri) {a:1,foo}'));
  });

  it('should decode recon with empty body', function () {
    var envelope = proto.decode(recon.parse('@event(1) @via(via_uri) @node(node_uri) @lane(lane_uri)'));
    assert(envelope.isEventMessage);
    assert.same(envelope.channel, 1);
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with non-empty body', function () {
    var envelope = proto.decode(recon.parse('@event(1) @via(via_uri) @node(node_uri) @lane(lane_uri) {a:1,foo}'));
    assert(envelope.isEventMessage);
    assert.same(envelope.channel, 1);
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });
});


describe('@command message', function () {
  it('should have required properties', function () {
    var envelope = new proto.CommandMessage(undefined, undefined, 'node_uri', 'lane_uri');
    assert(envelope.isCommandMessage);
    assert.same(envelope.channel, recon.extant);
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should encode recon with empty body', function () {
    var envelope = new proto.CommandMessage(1, 'via_uri', 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@command(1) @via(via_uri) @node(node_uri) @lane(lane_uri)'));

    envelope = new proto.CommandMessage(undefined, undefined, 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@command @node(node_uri) @lane(lane_uri)'));
  });

  it('should encode recon with non-empty body', function () {
    var envelope = new proto.CommandMessage(1, 'via_uri', 'node_uri', 'lane_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@command(1) @via(via_uri) @node(node_uri) @lane(lane_uri) {a:1,foo}'));

    envelope = new proto.CommandMessage(undefined, undefined, 'node_uri', 'lane_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@command @node(node_uri) @lane(lane_uri) {a:1,foo}'));
  });

  it('should decode recon with empty body', function () {
    var envelope = proto.decode(recon.parse('@command(1) @via(via_uri) @node(node_uri) @lane(lane_uri)'));
    assert(envelope.isCommandMessage);
    assert.same(envelope.channel, 1);
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with non-empty body', function () {
    var envelope = proto.decode(recon.parse('@command(1) @via(via_uri) @node(node_uri) @lane(lane_uri) {a:1,foo}'));
    assert(envelope.isCommandMessage);
    assert.same(envelope.channel, 1);
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });
});


describe('@send @event message', function () {
  it('should have required properties', function () {
    var envelope = new proto.SendEventMessage(undefined, undefined, 'node_uri', 'lane_uri');
    assert(envelope.isSendEventMessage);
    assert.same(envelope.channel, recon.extant);
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should encode recon with empty body', function () {
    var envelope = new proto.SendEventMessage(1, 'via_uri', 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@send @event(1) @via(via_uri) @node(node_uri) @lane(lane_uri)'));

    envelope = new proto.SendEventMessage(undefined, undefined, 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@send @event @node(node_uri) @lane(lane_uri)'));
  });

  it('should encode recon with non-empty body', function () {
    var envelope = new proto.SendEventMessage(1, 'via_uri', 'node_uri', 'lane_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@send @event(1) @via(via_uri) @node(node_uri) @lane(lane_uri) {a:1,foo}'));

    envelope = new proto.SendEventMessage(undefined, undefined, 'node_uri', 'lane_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@send @event @node(node_uri) @lane(lane_uri) {a:1,foo}'));
  });

  it('should decode recon with empty body', function () {
    var envelope = proto.decode(recon.parse('@send @event(1) @via(via_uri) @node(node_uri) @lane(lane_uri)'));
    assert(envelope.isSendEventMessage);
    assert.same(envelope.channel, 1);
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with non-empty body', function () {
    var envelope = proto.decode(recon.parse('@send @event(1) @via(via_uri) @node(node_uri) @lane(lane_uri) {a:1,foo}'));
    assert(envelope.isSendEventMessage);
    assert.same(envelope.channel, 1);
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });
});


describe('@send @command message', function () {
  it('should have required properties', function () {
    var envelope = new proto.SendCommandMessage(undefined, undefined, 'node_uri', 'lane_uri');
    assert(envelope.isSendCommandMessage);
    assert.same(envelope.channel, recon.extant);
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should encode recon with empty body', function () {
    var envelope = new proto.SendCommandMessage(1, 'via_uri', 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@send @command(1) @via(via_uri) @node(node_uri) @lane(lane_uri)'));

    envelope = new proto.SendCommandMessage(undefined, undefined, 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@send @command @node(node_uri) @lane(lane_uri)'));
  });

  it('should encode recon with non-empty body', function () {
    var envelope = new proto.SendCommandMessage(1, 'via_uri', 'node_uri', 'lane_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@send @command(1) @via(via_uri) @node(node_uri) @lane(lane_uri) {a:1,foo}'));

    envelope = new proto.SendCommandMessage(undefined, undefined, 'node_uri', 'lane_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@send @command @node(node_uri) @lane(lane_uri) {a:1,foo}'));
  });

  it('should decode recon with empty body', function () {
    var envelope = proto.decode(recon.parse('@send @command(1) @via(via_uri) @node(node_uri) @lane(lane_uri)'));
    assert(envelope.isSendCommandMessage);
    assert.same(envelope.channel, 1);
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with non-empty body', function () {
    var envelope = proto.decode(recon.parse('@send @command(1) @via(via_uri) @node(node_uri) @lane(lane_uri) {a:1,foo}'));
    assert(envelope.isSendCommandMessage);
    assert.same(envelope.channel, 1);
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });
});


describe('@link request', function () {
  it('should have required properties', function () {
    var envelope = new proto.LinkRequest(undefined, 'node_uri', 'lane_uri');
    assert(envelope.isLinkRequest);
    assert.same(envelope.channel, recon.extant);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should encode recon', function () {
    var envelope = new proto.LinkRequest(1, 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@link(1) @node(node_uri) @lane(lane_uri)'));
  });

  it('should decode recon', function () {
    var envelope = proto.decode(recon.parse('@link(1) @node(node_uri) @lane(lane_uri)'));
    assert(envelope.isLinkRequest);
    assert.same(envelope.channel, 1);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });
});


describe('@linked response', function () {
  it('should have required properties', function () {
    var envelope = new proto.LinkedResponse(undefined, 'node_uri', 'lane_uri');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.channel, recon.extant);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should encode recon', function () {
    var envelope = new proto.LinkedResponse(1, 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@linked(1) @node(node_uri) @lane(lane_uri)'));
  });

  it('should decode recon', function () {
    var envelope = proto.decode(recon.parse('@linked(1) @node(node_uri) @lane(lane_uri)'));
    assert(envelope.isLinkedResponse);
    assert.same(envelope.channel, 1);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });
});


describe('@unlink request', function () {
  it('should have required properties', function () {
    var envelope = new proto.UnlinkRequest();
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.channel, recon.extant);
    assert.same(envelope.node, recon.absent);
    assert.same(envelope.lane, recon.absent);
  });

  it('should encode recon', function () {
    var envelope = new proto.UnlinkRequest(1, 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@unlink(1) @node(node_uri) @lane(lane_uri)'));

    envelope = new proto.UnlinkRequest('channel_key');
    assert.same(envelope.encode(), recon.parse('@unlink(channel_key)'));
  });

  it('should decode recon', function () {
    var envelope = proto.decode(recon.parse('@unlink(1) @node(node_uri) @lane(lane_uri)'));
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.channel, 1);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });
});


describe('@unlinked response', function () {
  it('should have required properties', function () {
    var envelope = new proto.UnlinkedResponse(undefined, 'node_uri', 'lane_uri');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.channel, recon.extant);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should encode recon', function () {
    var envelope = new proto.UnlinkedResponse(1, 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@unlinked(1) @node(node_uri) @lane(lane_uri)'));
  });

  it('should decode recon', function () {
    var envelope = proto.decode(recon.parse('@unlinked(1) @node(node_uri) @lane(lane_uri)'));
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.channel, 1);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });
});


describe('@get request', function () {
  it('should have required properties', function () {
    var envelope = new proto.GetRequest(undefined, 'node_uri');
    assert(envelope.isGetRequest);
    assert.same(envelope.channel, recon.extant);
    assert.same(envelope.node, 'node_uri');
  });

  it('should encode recon', function () {
    var envelope = new proto.GetRequest(1, 'node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@get(1) @node(node_uri)'));
  });

  it('should decode recon', function () {
    var envelope = proto.decode(recon.parse('@get(1) @node(node_uri)'));
    assert(envelope.isGetRequest);
    assert.same(envelope.channel, 1);
    assert.same(envelope.node, 'node_uri');
  });
});


describe('@put request', function () {
  it('should have required properties', function () {
    var envelope = new proto.PutRequest(undefined, 'node_uri');
    assert(envelope.isPutRequest);
    assert.same(envelope.channel, recon.extant);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should encode recon with empty body', function () {
    var envelope = new proto.PutRequest(1, 'node_uri');
    assert.same(envelope.encode(), recon.parse('@put(1) @node(node_uri)'));
  });

  it('should encode recon with non-empty body', function () {
    var envelope = new proto.PutRequest(1, 'node_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@put(1) @node(node_uri) {a:1,foo}'));
  });

  it('should decode recon with empty body', function () {
    var envelope = proto.decode(recon.parse('@put(1) @node(node_uri)'));
    assert(envelope.isPutRequest);
    assert.same(envelope.channel, 1);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with non-empty body', function () {
    var envelope = proto.decode(recon.parse('@put(1) @node(node_uri) {a:1,foo}'));
    assert(envelope.isPutRequest);
    assert.same(envelope.channel, 1);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });
});

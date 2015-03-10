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
    var envelope = proto.decode('@event(node: "house#kitchen", lane: "light/on")');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'house#kitchen');
    assert.same(envelope.lane, 'light/on');
  });
});


describe('@event message', function () {
  it('should have required properties', function () {
    var envelope = new proto.EventMessage('node_uri', 'lane_uri');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });

  it('should encode recon with an empty body', function () {
    var envelope = new proto.EventMessage('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@event(node: node_uri, lane: lane_uri)'));
  });

  it('should encode recon with a non-empty body', function () {
    var envelope = new proto.EventMessage('node_uri', 'lane_uri', 'via_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@event(node: node_uri, lane: lane_uri, via: via_uri) {a:1,foo}'));
  });

  it('should decode recon with named headers and an empty body', function () {
    var envelope = proto.decode(recon.parse('@event(node: node_uri, lane: lane_uri)'));
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with named headers and a non-empty body', function () {
    var envelope = proto.decode(recon.parse('@event(node: node_uri, lane: lane_uri, via: via_uri) {a:1,foo}'));
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with positional headers and an empty body', function () {
    var envelope = proto.decode(recon.parse('@event(node_uri, lane_uri)'));
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional headers and a non-empty body', function () {
    var envelope = proto.decode(recon.parse('@event(node_uri, lane_uri, via_uri) {a:1,foo}'));
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@event(node: node_uri, lane: lane_uri, via: via_uri, foo: bar)'));
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@event(node_uri, lane_uri, via_uri, bar)'));
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.decode(recon.parse('@event()'));
    assert(envelope.isEventMessage);
    assert.same(envelope.node, '');
    assert.same(envelope.lane, '');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });
});


describe('@command message', function () {
  it('should have required properties', function () {
    var envelope = new proto.CommandMessage('node_uri', 'lane_uri');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });

  it('should encode recon with an empty body', function () {
    var envelope = new proto.CommandMessage('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@command(node: node_uri, lane: lane_uri)'));
  });

  it('should encode recon with a non-empty body', function () {
    var envelope = new proto.CommandMessage('node_uri', 'lane_uri', 'via_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@command(node: node_uri, lane: lane_uri, via: via_uri) {a:1,foo}'));
  });

  it('should decode recon with named headers and an empty body', function () {
    var envelope = proto.decode(recon.parse('@command(node: node_uri, lane: lane_uri)'));
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with named headers and a non-empty body', function () {
    var envelope = proto.decode(recon.parse('@command(node: node_uri, lane: lane_uri, via: via_uri) {a:1,foo}'));
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with positional headers and an empty body', function () {
    var envelope = proto.decode(recon.parse('@command(node_uri, lane_uri)'));
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional headers and a non-empty body', function () {
    var envelope = proto.decode(recon.parse('@command(node_uri, lane_uri, via_uri) {a:1,foo}'));
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@command(node: node_uri, lane: lane_uri, via: via_uri, foo: bar)'));
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@command(node_uri, lane_uri, via_uri, bar)'));
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.decode(recon.parse('@command()'));
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, '');
    assert.same(envelope.lane, '');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });
});


describe('@send @event message', function () {
  it('should have required properties', function () {
    var envelope = new proto.SendEventMessage('node_uri', 'lane_uri');
    assert(envelope.isSendEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should encode recon with an empty body', function () {
    var envelope = new proto.SendEventMessage('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@send @event(node: node_uri, lane: lane_uri)'));
  });

  it('should encode recon with a non-empty body', function () {
    var envelope = new proto.SendEventMessage('node_uri', 'lane_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@send @event(node: node_uri, lane: lane_uri) {a:1,foo}'));
  });

  it('should decode recon with named headers and an empty body', function () {
    var envelope = proto.decode(recon.parse('@send @event(node: node_uri, lane: lane_uri)'));
    assert(envelope.isSendEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with named headers and a non-empty body', function () {
    var envelope = proto.decode(recon.parse('@send @event(node: node_uri, lane: lane_uri) {a:1,foo}'));
    assert(envelope.isSendEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with positional headers and an empty body', function () {
    var envelope = proto.decode(recon.parse('@send @event(node_uri, lane_uri)'));
    assert(envelope.isSendEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional headers and a non-empty body', function () {
    var envelope = proto.decode(recon.parse('@send @event(node_uri, lane_uri) {a:1,foo}'));
    assert(envelope.isSendEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@send @event(node: node_uri, lane: lane_uri, foo: bar)'));
    assert(envelope.isSendEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@send @event(node_uri, lane_uri, bar)'));
    assert(envelope.isSendEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.decode(recon.parse('@send @event()'));
    assert(envelope.isSendEventMessage);
    assert.same(envelope.node, '');
    assert.same(envelope.lane, '');
    assert.same(envelope.body, recon.empty());
  });
});


describe('@send @command message', function () {
  it('should have required properties', function () {
    var envelope = new proto.SendCommandMessage('node_uri', 'lane_uri');
    assert(envelope.isSendCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should encode recon with an empty body', function () {
    var envelope = new proto.SendCommandMessage('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@send @command(node: node_uri, lane: lane_uri)'));
  });

  it('should encode recon with a non-empty body', function () {
    var envelope = new proto.SendCommandMessage('node_uri', 'lane_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@send @command(node: node_uri, lane: lane_uri) {a:1,foo}'));
  });

  it('should decode recon with named headers and an empty body', function () {
    var envelope = proto.decode(recon.parse('@send @command(node: node_uri, lane: lane_uri)'));
    assert(envelope.isSendCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with named headers and a non-empty body', function () {
    var envelope = proto.decode(recon.parse('@send @command(node: node_uri, lane: lane_uri) {a:1,foo}'));
    assert(envelope.isSendCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with positional headers and an empty body', function () {
    var envelope = proto.decode(recon.parse('@send @command(node_uri, lane_uri)'));
    assert(envelope.isSendCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional headers and a non-empty body', function () {
    var envelope = proto.decode(recon.parse('@send @command(node_uri, lane_uri) {a:1,foo}'));
    assert(envelope.isSendCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@send @command(node: node_uri, lane: lane_uri, foo: bar)'));
    assert(envelope.isSendCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@send @command(node_uri, lane_uri, bar)'));
    assert(envelope.isSendCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.decode(recon.parse('@send @command()'));
    assert(envelope.isSendCommandMessage);
    assert.same(envelope.node, '');
    assert.same(envelope.lane, '');
    assert.same(envelope.body, recon.empty());
  });
});


describe('@get request', function () {
  it('should have required properties', function () {
    var envelope = new proto.GetRequest('node_uri');
    assert(envelope.isGetRequest);
    assert.same(envelope.node, 'node_uri');
  });

  it('should encode recon', function () {
    var envelope = new proto.GetRequest('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@get(node: node_uri)'));
  });

  it('should decode recon with named headers', function () {
    var envelope = proto.decode(recon.parse('@get(node: node_uri)'));
    assert(envelope.isGetRequest);
    assert.same(envelope.node, 'node_uri');
  });

  it('should decode recon with positional headers', function () {
    var envelope = proto.decode(recon.parse('@get(node_uri)'));
    assert(envelope.isGetRequest);
    assert.same(envelope.node, 'node_uri');
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@get(node: node_uri, foo: bar)'));
    assert(envelope.isGetRequest);
    assert.same(envelope.node, 'node_uri');
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@get(node_uri, bar)'));
    assert(envelope.isGetRequest);
    assert.same(envelope.node, 'node_uri');
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.decode(recon.parse('@get()'));
    assert(envelope.isGetRequest);
    assert.same(envelope.node, '');
  });
});


describe('@put request', function () {
  it('should have required properties', function () {
    var envelope = new proto.PutRequest('node_uri');
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should encode recon with an empty body', function () {
    var envelope = new proto.PutRequest('node_uri');
    assert.same(envelope.encode(), recon.parse('@put(node: node_uri)'));
  });

  it('should encode recon with a non-empty body', function () {
    var envelope = new proto.PutRequest('node_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@put(node: node_uri) {a:1,foo}'));
  });

  it('should decode recon with named headers and an empty body', function () {
    var envelope = proto.decode(recon.parse('@put(node: node_uri)'));
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with named headers and a non-empty body', function () {
    var envelope = proto.decode(recon.parse('@put(node: node_uri) {a:1,foo}'));
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with positional headers and an empty body', function () {
    var envelope = proto.decode(recon.parse('@put(node_uri)'));
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional headers and a non-empty body', function () {
    var envelope = proto.decode(recon.parse('@put(node_uri) {a:1,foo}'));
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@put(node: node_uri, foo: bar)'));
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@put(node_uri, bar)'));
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.decode(recon.parse('@put()'));
    assert(envelope.isPutRequest);
    assert.same(envelope.node, '');
    assert.same(envelope.body, recon.empty());
  });
});


describe('@state response', function () {
  it('should have required properties', function () {
    var envelope = new proto.StateResponse('node_uri');
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should encode recon with an empty body', function () {
    var envelope = new proto.StateResponse('node_uri');
    assert.same(envelope.encode(), recon.parse('@state(node: node_uri)'));
  });

  it('should encode recon with a non-empty body', function () {
    var envelope = new proto.StateResponse('node_uri', recon.parse('a:1,foo'));
    assert.same(envelope.encode(), recon.parse('@state(node: node_uri) {a:1,foo}'));
  });

  it('should decode recon with named headers and an empty body', function () {
    var envelope = proto.decode(recon.parse('@state(node: node_uri)'));
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with named headers and a non-empty body', function () {
    var envelope = proto.decode(recon.parse('@state(node: node_uri) {a:1,foo}'));
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with positional headers and an empty body', function () {
    var envelope = proto.decode(recon.parse('@state(node_uri)'));
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional headers and a non-empty body', function () {
    var envelope = proto.decode(recon.parse('@state(node_uri) {a:1,foo}'));
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@state(node: node_uri, foo: bar)'));
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@state(node_uri, bar)'));
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.decode(recon.parse('@state()'));
    assert(envelope.isStateResponse);
    assert.same(envelope.node, '');
    assert.same(envelope.body, recon.empty());
  });
});


describe('@link request', function () {
  it('should have required properties', function () {
    var envelope = new proto.LinkRequest('node_uri', 'lane_uri');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should encode recon', function () {
    var envelope = new proto.LinkRequest('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@link(node: node_uri, lane: lane_uri)'));
  });

  it('should decode recon with named headers', function () {
    var envelope = proto.decode(recon.parse('@link(node: node_uri, lane: lane_uri)'));
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional headers', function () {
    var envelope = proto.decode(recon.parse('@link(node_uri, lane_uri)'));
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@link(node: node_uri, lane: lane_uri, foo: bar)'));
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@link(node_uri, lane_uri, bar)'));
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.decode(recon.parse('@link()'));
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, '');
    assert.same(envelope.lane, '');
  });
});


describe('@linked response', function () {
  it('should have required properties', function () {
    var envelope = new proto.LinkedResponse('node_uri', 'lane_uri');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should encode recon', function () {
    var envelope = new proto.LinkedResponse('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@linked(node: node_uri, lane: lane_uri)'));
  });

  it('should decode recon with named headers', function () {
    var envelope = proto.decode(recon.parse('@linked(node: node_uri, lane: lane_uri)'));
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional headers', function () {
    var envelope = proto.decode(recon.parse('@linked(node_uri, lane_uri)'));
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@linked(node: node_uri, lane: lane_uri, foo: bar)'));
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@linked(node_uri, lane_uri, bar)'));
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.decode(recon.parse('@linked()'));
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, '');
    assert.same(envelope.lane, '');
  });
});


describe('@unlink request', function () {
  it('should have required properties', function () {
    var envelope = new proto.UnlinkRequest('node_uri', 'lane_uri');
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should encode recon', function () {
    var envelope = new proto.UnlinkRequest('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@unlink(node: node_uri, lane: lane_uri)'));
  });

  it('should decode recon with named headers', function () {
    var envelope = proto.decode(recon.parse('@unlink(node: node_uri, lane: lane_uri)'));
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional headers', function () {
    var envelope = proto.decode(recon.parse('@unlink(node_uri, lane_uri)'));
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@unlink(node: node_uri, lane: lane_uri, foo: bar)'));
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@unlink(node_uri, lane_uri, bar)'));
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.decode(recon.parse('@unlink()'));
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, '');
    assert.same(envelope.lane, '');
  });
});


describe('@unlinked response', function () {
  it('should have required properties', function () {
    var envelope = new proto.UnlinkedResponse('node_uri', 'lane_uri');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should encode recon', function () {
    var envelope = new proto.UnlinkedResponse('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@unlinked(node: node_uri, lane: lane_uri)'));
  });

  it('should decode recon with named headers', function () {
    var envelope = proto.decode(recon.parse('@unlinked(node: node_uri, lane: lane_uri)'));
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional headers', function () {
    var envelope = proto.decode(recon.parse('@unlinked(node_uri, lane_uri)'));
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@unlinked(node: node_uri, lane: lane_uri, foo: bar)'));
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.decode(recon.parse('@unlinked(node_uri, lane_uri, bar)'));
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.decode(recon.parse('@unlinked()'));
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, '');
    assert.same(envelope.lane, '');
  });
});

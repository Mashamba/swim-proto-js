'use strict';
/* global describe: false */
/* global it: false */

var assert = require('assert');
var recon = require('recon-js');
var proto = require('./swim-proto.js');

assert.same = function (x, y) {
  if (!recon.compare(x, y))
    assert.fail(false, true, recon.stringify(x) + ' did not equal ' + recon.stringify(y));
};


describe('Envelope transcoding', function () {
  it('should decode envelopes from recon objects', function () {
    var envelope = proto.decode(recon(
      recon.attr('event', recon(
        recon.slot('node', 'house#kitchen'),
        recon.slot('lane', 'light/on')))));
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'house#kitchen');
    assert.same(envelope.lane, 'light/on');
  });

  it('should encode envelopes as recon objects', function () {
    var envelope = new proto.EventMessage('house#kitchen', 'light/on');
    var record = recon(
      recon.attr('event', recon(
        recon.slot('node', 'house#kitchen'),
        recon.slot('lane', 'light/on'))));
    assert.same(proto.encode(envelope), record);
  });

  it('should parse envelopes from recon strings', function () {
    var envelope = proto.parse('@event(node: "house#kitchen", lane: "light/on")');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'house#kitchen');
    assert.same(envelope.lane, 'light/on');
  });

  it('should stringify envelopes as recon strings', function () {
    var envelope = new proto.EventMessage('house#kitchen', 'light/on');
    assert.same(proto.stringify(envelope), '@event(node:"house#kitchen",lane:"light/on")');
  });

  it('should parse unknown envelopes as undefined', function () {
    assert(typeof proto.parse('') === 'undefined');
    assert(typeof proto.parse('@foo') === 'undefined');
    assert(typeof proto.parse('foo,bar') === 'undefined');
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
    var envelope = proto.parse('@event(node: node_uri, lane: lane_uri)');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with named headers and a non-empty body', function () {
    var envelope = proto.parse('@event(node: node_uri, lane: lane_uri, via: via_uri) {a:1,foo}');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with positional headers and an empty body', function () {
    var envelope = proto.parse('@event(node_uri, lane_uri)');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional headers and a non-empty body', function () {
    var envelope = proto.parse('@event(node_uri, lane_uri, via_uri) {a:1,foo}');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.parse('@event(node: node_uri, lane: lane_uri, via: via_uri, foo: bar)');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.parse('@event(node_uri, lane_uri, via_uri, bar)');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.parse('@event()');
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
    var envelope = proto.parse('@command(node: node_uri, lane: lane_uri)');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with named headers and a non-empty body', function () {
    var envelope = proto.parse('@command(node: node_uri, lane: lane_uri, via: via_uri) {a:1,foo}');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with positional headers and an empty body', function () {
    var envelope = proto.parse('@command(node_uri, lane_uri)');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional headers and a non-empty body', function () {
    var envelope = proto.parse('@command(node_uri, lane_uri, via_uri) {a:1,foo}');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.parse('@command(node: node_uri, lane: lane_uri, via: via_uri, foo: bar)');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.parse('@command(node_uri, lane_uri, via_uri, bar)');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.parse('@command()');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, '');
    assert.same(envelope.lane, '');
    assert.same(envelope.via, recon.absent);
    assert.same(envelope.body, recon.empty());
  });
});


describe('@sync request', function () {
  it('should have required properties', function () {
    var envelope = new proto.SyncRequest('node_uri', 'lane_uri');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should encode recon', function () {
    var envelope = new proto.SyncRequest('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@sync(node: node_uri, lane: lane_uri)'));
  });

  it('should decode recon with named headers', function () {
    var envelope = proto.parse('@sync(node: node_uri, lane: lane_uri)');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional headers', function () {
    var envelope = proto.parse('@sync(node_uri, lane_uri)');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.parse('@sync(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.parse('@sync(node_uri, lane_uri, bar)');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.parse('@sync()');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, '');
    assert.same(envelope.lane, '');
  });
});


describe('@synced response', function () {
  it('should have required properties', function () {
    var envelope = new proto.SyncedResponse('node_uri', 'lane_uri');
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should encode recon', function () {
    var envelope = new proto.SyncedResponse('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@synced(node: node_uri, lane: lane_uri)'));
  });

  it('should decode recon with named headers', function () {
    var envelope = proto.parse('@synced(node: node_uri, lane: lane_uri)');
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional headers', function () {
    var envelope = proto.parse('@synced(node_uri, lane_uri)');
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.parse('@synced(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.parse('@synced(node_uri, lane_uri, bar)');
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.parse('@synced()');
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, '');
    assert.same(envelope.lane, '');
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
    var envelope = proto.parse('@link(node: node_uri, lane: lane_uri)');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional headers', function () {
    var envelope = proto.parse('@link(node_uri, lane_uri)');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.parse('@link(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.parse('@link(node_uri, lane_uri, bar)');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.parse('@link()');
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
    var envelope = proto.parse('@linked(node: node_uri, lane: lane_uri)');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional headers', function () {
    var envelope = proto.parse('@linked(node_uri, lane_uri)');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.parse('@linked(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.parse('@linked(node_uri, lane_uri, bar)');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.parse('@linked()');
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
    var envelope = proto.parse('@unlink(node: node_uri, lane: lane_uri)');
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional headers', function () {
    var envelope = proto.parse('@unlink(node_uri, lane_uri)');
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.parse('@unlink(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.parse('@unlink(node_uri, lane_uri, bar)');
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.parse('@unlink()');
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
    var envelope = proto.parse('@unlinked(node: node_uri, lane: lane_uri)');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional headers', function () {
    var envelope = proto.parse('@unlinked(node_uri, lane_uri)');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.parse('@unlinked(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.parse('@unlinked(node_uri, lane_uri, bar)');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.parse('@unlinked()');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, '');
    assert.same(envelope.lane, '');
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
    var envelope = proto.parse('@get(node: node_uri)');
    assert(envelope.isGetRequest);
    assert.same(envelope.node, 'node_uri');
  });

  it('should decode recon with positional headers', function () {
    var envelope = proto.parse('@get(node_uri)');
    assert(envelope.isGetRequest);
    assert.same(envelope.node, 'node_uri');
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.parse('@get(node: node_uri, foo: bar)');
    assert(envelope.isGetRequest);
    assert.same(envelope.node, 'node_uri');
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.parse('@get(node_uri, bar)');
    assert(envelope.isGetRequest);
    assert.same(envelope.node, 'node_uri');
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.parse('@get()');
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
    var envelope = proto.parse('@put(node: node_uri)');
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with named headers and a non-empty body', function () {
    var envelope = proto.parse('@put(node: node_uri) {a:1,foo}');
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with positional headers and an empty body', function () {
    var envelope = proto.parse('@put(node_uri)');
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional headers and a non-empty body', function () {
    var envelope = proto.parse('@put(node_uri) {a:1,foo}');
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.parse('@put(node: node_uri, foo: bar)');
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.parse('@put(node_uri, bar)');
    assert(envelope.isPutRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.parse('@put()');
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
    var envelope = proto.parse('@state(node: node_uri)');
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with named headers and a non-empty body', function () {
    var envelope = proto.parse('@state(node: node_uri) {a:1,foo}');
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with positional headers and an empty body', function () {
    var envelope = proto.parse('@state(node_uri)');
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional headers and a non-empty body', function () {
    var envelope = proto.parse('@state(node_uri) {a:1,foo}');
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.parse('a:1,foo'));
  });

  it('should decode recon with named and unknown headers', function () {
    var envelope = proto.parse('@state(node: node_uri, foo: bar)');
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with positional and unknown headers', function () {
    var envelope = proto.parse('@state(node_uri, bar)');
    assert(envelope.isStateResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.body, recon.empty());
  });

  it('should decode recon with missing headers', function () {
    var envelope = proto.parse('@state()');
    assert(envelope.isStateResponse);
    assert.same(envelope.node, '');
    assert.same(envelope.body, recon.empty());
  });
});

'use strict';
/* global describe: false */
/* global it: false */

var assert = require('assert');
var recon = require('recon-js');
var pkg = require('./package.json');
var proto = require('./swim-proto.js');

assert.same = function (x, y) {
  if (!recon.equal(x, y)) {
    assert.fail(false, true, recon.stringify(x) + ' did not equal ' + recon.stringify(y));
  }
};


describe('Swim protocol library', function () {
  it('should expose its build config', function () {
    assert.equal(proto.config.version, pkg.version);
  });
});


describe('Envelope transcoding', function () {
  it('should decode envelopes from RECON objects', function () {
    var envelope = proto.decode([{'@event': [{node: 'house#kitchen'}, {lane: 'light/on'}]}]);
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'house#kitchen');
    assert.same(envelope.lane, 'light/on');
  });

  it('should encode envelopes as RECON objects', function () {
    var envelope = new proto.EventMessage('house#kitchen', 'light/on');
    var record = [{'@event': [{node: 'house#kitchen'}, {lane: 'light/on'}]}];
    assert.same(proto.encode(envelope), record);
  });

  it('should parse envelopes from RECON strings', function () {
    var envelope = proto.parse('@event(node: "house#kitchen", lane: "light/on")');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'house#kitchen');
    assert.same(envelope.lane, 'light/on');
  });

  it('should stringify envelopes as RECON strings', function () {
    var envelope = new proto.EventMessage('house#kitchen', 'light/on');
    assert.same(proto.stringify(envelope), '@event(node:"house#kitchen",lane:"light/on")');
  });

  it('should parse unknown envelopes as undefined', function () {
    assert(proto.parse('') === undefined);
    assert(proto.parse('@foo') === undefined);
    assert(proto.parse('foo,bar') === undefined);
  });
});


describe('@event messages', function () {
  it('should have header properties', function () {
    var envelope = new proto.EventMessage('node_uri', 'lane_uri', true);
    assert(envelope.isMessage);
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, true);
  });

  it('should support readdressing', function () {
    var envelope1 = new proto.EventMessage('node1_uri', 'lane1_uri', true);
    var envelope2 = envelope1.withAddress('node2_uri', 'lane2_uri');
    assert(envelope2.isEventMessage);
    assert.same(envelope2.node, 'node2_uri');
    assert.same(envelope2.lane, 'lane2_uri');
    assert.same(envelope2.body, true);
    var envelope3 = envelope2.withAddress();
    assert(envelope3.isEventMessage);
    assert.same(envelope3.node, 'node2_uri');
    assert.same(envelope3.lane, 'lane2_uri');
    assert.same(envelope3.body, true);
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.EventMessage('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@event(node: node_uri, lane: lane_uri)'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.EventMessage('node_uri', 'lane_uri', [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@event(node: node_uri, lane: lane_uri) {a:1,foo}'));
  });

  it('should decode RECON with a non-empty body', function () {
    var envelope = proto.parse('@event(node: node_uri, lane: lane_uri) {a:1,foo}');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });

  it('should decode RECON with named headers', function () {
    var envelope = proto.parse('@event(node: node_uri, lane: lane_uri)');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional headers', function () {
    var envelope = proto.parse('@event(node_uri, lane_uri)');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, []);
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@event(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@event(node_uri, lane_uri, bar)');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, []);
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@event()');
    assert(envelope === undefined);
  });
});


describe('@command messages', function () {
  it('should have header properties', function () {
    var envelope = new proto.CommandMessage('node_uri', 'lane_uri', true);
    assert(envelope.isMessage);
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, true);
  });

  it('should support readdressing', function () {
    var envelope1 = new proto.CommandMessage('node1_uri', 'lane1_uri', true);
    var envelope2 = envelope1.withAddress('node2_uri', 'lane2_uri');
    assert(envelope2.isCommandMessage);
    assert.same(envelope2.node, 'node2_uri');
    assert.same(envelope2.lane, 'lane2_uri');
    assert.same(envelope2.body, true);
    var envelope3 = envelope2.withAddress();
    assert(envelope3.isCommandMessage);
    assert.same(envelope3.node, 'node2_uri');
    assert.same(envelope3.lane, 'lane2_uri');
    assert.same(envelope3.body, true);
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.CommandMessage('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@command(node: node_uri, lane: lane_uri)'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.CommandMessage('node_uri', 'lane_uri', [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@command(node: node_uri, lane: lane_uri) {a:1,foo}'));
  });

  it('should decode RECON with a non-empty body', function () {
    var envelope = proto.parse('@command(node: node_uri, lane: lane_uri) {a:1,foo}');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });

  it('should decode RECON with named headers', function () {
    var envelope = proto.parse('@command(node: node_uri, lane: lane_uri)');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional headers', function () {
    var envelope = proto.parse('@command(node_uri, lane_uri)');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, []);
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@command(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@command(node_uri, lane_uri, bar)');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, []);
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@command()');
    assert(envelope === undefined);
  });
});


describe('@link requests', function () {
  it('should have header properties', function () {
    var envelope = new proto.LinkRequest('node_uri', 'lane_uri', 0.5, true);
    assert(envelope.isRequest);
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.5);
    assert.same(envelope.body, true);
  });

  it('should support readdressing', function () {
    var envelope1 = new proto.LinkRequest('node1_uri', 'lane1_uri', 0.5, true);
    var envelope2 = envelope1.withAddress('node2_uri', 'lane2_uri');
    assert(envelope2.isLinkRequest);
    assert.same(envelope2.node, 'node2_uri');
    assert.same(envelope2.lane, 'lane2_uri');
    assert.same(envelope2.prio, 0.5);
    assert.same(envelope2.body, true);
    var envelope3 = envelope2.withAddress();
    assert(envelope3.isLinkRequest);
    assert.same(envelope3.node, 'node2_uri');
    assert.same(envelope3.lane, 'lane2_uri');
    assert.same(envelope3.prio, 0.5);
    assert.same(envelope3.body, true);
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.LinkRequest('node_uri', 'lane_uri', 0.5);
    assert.same(envelope.encode(), recon.parse('@link(node: node_uri, lane: lane_uri, prio: 0.5)'));
    envelope = new proto.LinkRequest('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@link(node: node_uri, lane: lane_uri)'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.LinkRequest('node_uri', 'lane_uri', 0.5, [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@link(node: node_uri, lane: lane_uri, prio: 0.5) {a:1,foo}'));
    envelope = new proto.LinkRequest('node_uri', 'lane_uri', 0.0, [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@link(node: node_uri, lane: lane_uri) {a:1,foo}'));
  });

  it('should decode RECON with a non-empty body', function () {
    var envelope = proto.parse('@link(node: node_uri, lane: lane_uri, prio: 0.5) {a:1,foo}');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.5);
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });

  it('should decode RECON with named headers', function () {
    var envelope = proto.parse('@link(node: node_uri, lane: lane_uri, prio: 0.5)');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.5);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional headers', function () {
    var envelope = proto.parse('@link(node_uri, lane_uri)');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@link(node: node_uri, lane: lane_uri, foo: bar, prio: 0.5)');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.5);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@link(node_uri, lane_uri, bar)');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
    assert.same(envelope.body, []);
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@link()');
    assert(envelope === undefined);
  });
});


describe('@linked responses', function () {
  it('should have header properties', function () {
    var envelope = new proto.LinkedResponse('node_uri', 'lane_uri', 1.0, true);
    assert(envelope.isResponse);
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 1.0);
    assert.same(envelope.body, true);
  });

  it('should support readdressing', function () {
    var envelope1 = new proto.LinkedResponse('node1_uri', 'lane1_uri', 0.5, true);
    var envelope2 = envelope1.withAddress('node2_uri', 'lane2_uri');
    assert(envelope2.isLinkedResponse);
    assert.same(envelope2.node, 'node2_uri');
    assert.same(envelope2.lane, 'lane2_uri');
    assert.same(envelope2.prio, 0.5);
    assert.same(envelope2.body, true);
    var envelope3 = envelope2.withAddress();
    assert(envelope3.isLinkedResponse);
    assert.same(envelope3.node, 'node2_uri');
    assert.same(envelope3.lane, 'lane2_uri');
    assert.same(envelope3.prio, 0.5);
    assert.same(envelope3.body, true);
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.LinkedResponse('node_uri', 'lane_uri', 0.5);
    assert.same(envelope.encode(), recon.parse('@linked(node: node_uri, lane: lane_uri, prio: 0.5)'));
    envelope = new proto.LinkedResponse('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@linked(node: node_uri, lane: lane_uri)'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.LinkedResponse('node_uri', 'lane_uri', 0.5, [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@linked(node: node_uri, lane: lane_uri, prio: 0.5) {a:1,foo}'));
    envelope = new proto.LinkedResponse('node_uri', 'lane_uri', 0.0, [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@linked(node: node_uri, lane: lane_uri) {a:1,foo}'));
  });

  it('should decode RECON with a non-empty body', function () {
    var envelope = proto.parse('@linked(node: node_uri, lane: lane_uri, prio: 0.5) {a:1,foo}');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.5);
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });

  it('should decode RECON with named headers', function () {
    var envelope = proto.parse('@linked(node: node_uri, lane: lane_uri, prio: 0.5)');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.5);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional headers', function () {
    var envelope = proto.parse('@linked(node_uri, lane_uri)');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@linked(node: node_uri, lane: lane_uri, foo: bar, prio: 0.5)');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.5);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@linked(node_uri, lane_uri, bar)');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
    assert.same(envelope.body, []);
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@linked()');
    assert(envelope === undefined);
  });
});


describe('@sync requests', function () {
  it('should have header properties', function () {
    var envelope = new proto.SyncRequest('node_uri', 'lane_uri', 1.0, true);
    assert(envelope.isRequest);
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 1.0);
    assert.same(envelope.body, true);
  });

  it('should support readdressing', function () {
    var envelope1 = new proto.SyncRequest('node1_uri', 'lane1_uri', 0.5, true);
    var envelope2 = envelope1.withAddress('node2_uri', 'lane2_uri');
    assert(envelope2.isSyncRequest);
    assert.same(envelope2.node, 'node2_uri');
    assert.same(envelope2.lane, 'lane2_uri');
    assert.same(envelope2.prio, 0.5);
    assert.same(envelope2.body, true);
    var envelope3 = envelope2.withAddress();
    assert(envelope3.isSyncRequest);
    assert.same(envelope3.node, 'node2_uri');
    assert.same(envelope3.lane, 'lane2_uri');
    assert.same(envelope3.prio, 0.5);
    assert.same(envelope3.body, true);
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.SyncRequest('node_uri', 'lane_uri', 0.5);
    assert.same(envelope.encode(), recon.parse('@sync(node: node_uri, lane: lane_uri, prio: 0.5)'));
    envelope = new proto.SyncRequest('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@sync(node: node_uri, lane: lane_uri)'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.SyncRequest('node_uri', 'lane_uri', 0.5, [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@sync(node: node_uri, lane: lane_uri, prio: 0.5) {a:1,foo}'));
    envelope = new proto.SyncRequest('node_uri', 'lane_uri', 0.0, [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@sync(node: node_uri, lane: lane_uri) {a:1,foo}'));
  });

  it('should decode RECON with a non-empty body', function () {
    var envelope = proto.parse('@sync(node: node_uri, lane: lane_uri, prio: 0.5) {a:1,foo}');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.5);
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });

  it('should decode RECON with named headers', function () {
    var envelope = proto.parse('@sync(node: node_uri, lane: lane_uri, prio: 0.5)');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.5);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional headers', function () {
    var envelope = proto.parse('@sync(node_uri, lane_uri)');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@sync(node: node_uri, lane: lane_uri, foo: bar, prio: 0.5)');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.5);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@sync(node_uri, lane_uri, bar)');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
    assert.same(envelope.body, []);
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@sync()');
    assert(envelope === undefined);
  });
});


describe('@synced responses', function () {
  it('should have header properties', function () {
    var envelope = new proto.SyncedResponse('node_uri', 'lane_uri', true);
    assert(envelope.isResponse);
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, true);
  });

  it('should support readdressing', function () {
    var envelope1 = new proto.SyncedResponse('node1_uri', 'lane1_uri', true);
    var envelope2 = envelope1.withAddress('node2_uri', 'lane2_uri');
    assert(envelope2.isSyncedResponse);
    assert.same(envelope2.node, 'node2_uri');
    assert.same(envelope2.lane, 'lane2_uri');
    assert.same(envelope2.body, true);
    var envelope3 = envelope2.withAddress();
    assert(envelope3.isSyncedResponse);
    assert.same(envelope3.node, 'node2_uri');
    assert.same(envelope3.lane, 'lane2_uri');
    assert.same(envelope3.body, true);
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.SyncedResponse('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@synced(node: node_uri, lane: lane_uri)'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.SyncedResponse('node_uri', 'lane_uri', [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@synced(node: node_uri, lane: lane_uri) {a:1,foo}'));
  });

  it('should decode RECON with a non-empty body', function () {
    var envelope = proto.parse('@synced(node: node_uri, lane: lane_uri) {a:1,foo}');
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });

  it('should decode RECON with named headers', function () {
    var envelope = proto.parse('@synced(node: node_uri, lane: lane_uri)');
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode RECON with positional headers', function () {
    var envelope = proto.parse('@synced(node_uri, lane_uri)');
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@synced(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@synced(node_uri, lane_uri, bar)');
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@synced()');
    assert(envelope === undefined);
  });
});


describe('@unlink requests', function () {
  it('should have header properties', function () {
    var envelope = new proto.UnlinkRequest('node_uri', 'lane_uri', true);
    assert(envelope.isRequest);
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, true);
  });

  it('should support readdressing', function () {
    var envelope1 = new proto.UnlinkRequest('node1_uri', 'lane1_uri', true);
    var envelope2 = envelope1.withAddress('node2_uri', 'lane2_uri');
    assert(envelope2.isUnlinkRequest);
    assert.same(envelope2.node, 'node2_uri');
    assert.same(envelope2.lane, 'lane2_uri');
    assert.same(envelope2.body, true);
    var envelope3 = envelope2.withAddress();
    assert(envelope3.isUnlinkRequest);
    assert.same(envelope3.node, 'node2_uri');
    assert.same(envelope3.lane, 'lane2_uri');
    assert.same(envelope3.body, true);
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.UnlinkRequest('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@unlink(node: node_uri, lane: lane_uri)'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.UnlinkRequest('node_uri', 'lane_uri', [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@unlink(node: node_uri, lane: lane_uri) {a:1,foo}'));
  });

  it('should decode RECON with a non-empty body', function () {
    var envelope = proto.parse('@unlink(node: node_uri, lane: lane_uri) {a:1,foo}');
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });

  it('should decode RECON with named headers', function () {
    var envelope = proto.parse('@unlink(node: node_uri, lane: lane_uri)');
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode RECON with positional headers', function () {
    var envelope = proto.parse('@unlink(node_uri, lane_uri)');
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@unlink(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@unlink(node_uri, lane_uri, bar)');
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@unlink()');
    assert(envelope === undefined);
  });
});


describe('@unlinked responses', function () {
  it('should have header properties', function () {
    var envelope = new proto.UnlinkedResponse('node_uri', 'lane_uri', true);
    assert(envelope.isResponse);
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, true);
  });

  it('should support readdressing', function () {
    var envelope1 = new proto.UnlinkedResponse('node1_uri', 'lane1_uri', true);
    var envelope2 = envelope1.withAddress('node2_uri', 'lane2_uri');
    assert(envelope2.isUnlinkedResponse);
    assert.same(envelope2.node, 'node2_uri');
    assert.same(envelope2.lane, 'lane2_uri');
    assert.same(envelope2.body, true);
    var envelope3 = envelope2.withAddress();
    assert(envelope3.isUnlinkedResponse);
    assert.same(envelope3.node, 'node2_uri');
    assert.same(envelope3.lane, 'lane2_uri');
    assert.same(envelope3.body, true);
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.UnlinkedResponse('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@unlinked(node: node_uri, lane: lane_uri)'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.UnlinkedResponse('node_uri', 'lane_uri', [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@unlinked(node: node_uri, lane: lane_uri) {a:1,foo}'));
  });

  it('should decode RECON with a non-empty body', function () {
    var envelope = proto.parse('@unlinked(node: node_uri, lane: lane_uri) {a:1,foo}');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });

  it('should decode RECON with named headers', function () {
    var envelope = proto.parse('@unlinked(node: node_uri, lane: lane_uri)');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode RECON with positional headers', function () {
    var envelope = proto.parse('@unlinked(node_uri, lane_uri)');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@unlinked(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@unlinked(node_uri, lane_uri, bar)');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@unlinked()');
    assert(envelope === undefined);
  });
});


describe('@auth requests', function () {
  it('should have header properties', function () {
    var envelope = new proto.AuthRequest('body');
    assert(envelope.isRequest);
    assert(envelope.isAuthRequest);
    assert.same(envelope.body, 'body');
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.AuthRequest();
    assert.same(envelope.encode(), recon.parse('@auth'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.AuthRequest([{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@auth {a:1,foo}'));
  });

  it('should decode RECON with an empty body', function () {
    var envelope = proto.parse('@auth');
    assert(envelope.isAuthRequest);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with a non-empty body', function () {
    var envelope = proto.parse('@auth {a:1,foo}');
    assert(envelope.isAuthRequest);
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });
});


describe('@authed responses', function () {
  it('should have header properties', function () {
    var envelope = new proto.AuthedResponse('body');
    assert(envelope.isResponse);
    assert(envelope.isAuthedResponse);
    assert.same(envelope.body, 'body');
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.AuthedResponse();
    assert.same(envelope.encode(), recon.parse('@authed'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.AuthedResponse([{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@authed {a:1,foo}'));
  });

  it('should decode RECON with an empty body', function () {
    var envelope = proto.parse('@authed');
    assert(envelope.isAuthedResponse);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with a non-empty body', function () {
    var envelope = proto.parse('@authed {a:1,foo}');
    assert(envelope.isAuthedResponse);
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });
});


describe('@deauth requests', function () {
  it('should have header properties', function () {
    var envelope = new proto.DeauthRequest('body');
    assert(envelope.isRequest);
    assert(envelope.isDeauthRequest);
    assert.same(envelope.body, 'body');
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.DeauthRequest();
    assert.same(envelope.encode(), recon.parse('@deauth'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.DeauthRequest([{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@deauth {a:1,foo}'));
  });

  it('should decode RECON with an empty body', function () {
    var envelope = proto.parse('@deauth');
    assert(envelope.isDeauthRequest);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with a non-empty body', function () {
    var envelope = proto.parse('@deauth {a:1,foo}');
    assert(envelope.isDeauthRequest);
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });
});


describe('@deauthed responses', function () {
  it('should have header properties', function () {
    var envelope = new proto.DeauthedResponse('body');
    assert(envelope.isResponse);
    assert(envelope.isDeauthedResponse);
    assert.same(envelope.body, 'body');
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.DeauthedResponse();
    assert.same(envelope.encode(), recon.parse('@deauthed'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.DeauthedResponse([{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@deauthed {a:1,foo}'));
  });

  it('should decode RECON with an empty body', function () {
    var envelope = proto.parse('@deauthed');
    assert(envelope.isDeauthedResponse);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with a non-empty body', function () {
    var envelope = proto.parse('@deauthed {a:1,foo}');
    assert(envelope.isDeauthedResponse);
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });
});

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


describe('SWIM protocol library', function () {
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
    var envelope = new proto.EventMessage('node_uri', 'lane_uri', [], true);
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, []);
    assert.same(envelope.body, true);
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.EventMessage('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@event(node: node_uri, lane: lane_uri)'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.EventMessage('node_uri', 'lane_uri', 'via_uri', [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@event(node: node_uri, lane: lane_uri, via: via_uri) {a:1,foo}'));
  });

  it('should decode RECON with named headers and an empty body', function () {
    var envelope = proto.parse('@event(node: node_uri, lane: lane_uri)');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, undefined);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with named headers and a non-empty body', function () {
    var envelope = proto.parse('@event(node: node_uri, lane: lane_uri, via: via_uri) {a:1,foo}');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });

  it('should decode RECON with positional headers and an empty body', function () {
    var envelope = proto.parse('@event(node_uri, lane_uri)');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, undefined);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional headers and a non-empty body', function () {
    var envelope = proto.parse('@event(node_uri, lane_uri, via_uri) {a:1,foo}');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@event(node: node_uri, lane: lane_uri, via: via_uri, foo: bar)');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@event(node_uri, lane_uri, via_uri, bar)');
    assert(envelope.isEventMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, []);
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@event()');
    assert(envelope === undefined);
  });
});


describe('@command messages', function () {
  it('should have header properties', function () {
    var envelope = new proto.CommandMessage('node_uri', 'lane_uri', [], true);
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, []);
    assert.same(envelope.body, true);
  });

  it('should encode RECON with an empty body', function () {
    var envelope = new proto.CommandMessage('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@command(node: node_uri, lane: lane_uri)'));
  });

  it('should encode RECON with a non-empty body', function () {
    var envelope = new proto.CommandMessage('node_uri', 'lane_uri', 'via_uri', [{a: 1}, 'foo']);
    assert.same(envelope.encode(), recon.parse('@command(node: node_uri, lane: lane_uri, via: via_uri) {a:1,foo}'));
  });

  it('should decode RECON with named headers and an empty body', function () {
    var envelope = proto.parse('@command(node: node_uri, lane: lane_uri)');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, undefined);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with named headers and a non-empty body', function () {
    var envelope = proto.parse('@command(node: node_uri, lane: lane_uri, via: via_uri) {a:1,foo}');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });

  it('should decode RECON with positional headers and an empty body', function () {
    var envelope = proto.parse('@command(node_uri, lane_uri)');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, undefined);
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional headers and a non-empty body', function () {
    var envelope = proto.parse('@command(node_uri, lane_uri, via_uri) {a:1,foo}');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, [{a: 1}, 'foo']);
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@command(node: node_uri, lane: lane_uri, via: via_uri, foo: bar)');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, []);
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@command(node_uri, lane_uri, via_uri, bar)');
    assert(envelope.isCommandMessage);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.via, 'via_uri');
    assert.same(envelope.body, []);
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@command()');
    assert(envelope === undefined);
  });
});


describe('@sync requests', function () {
  it('should have header properties', function () {
    var envelope = new proto.SyncRequest('node_uri', 'lane_uri', 1.0);
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 1.0);
  });

  it('should encode RECON with a prio header', function () {
    var envelope = new proto.SyncRequest('node_uri', 'lane_uri', 1.0);
    assert.same(envelope.encode(), recon.parse('@sync(node: node_uri, lane: lane_uri, prio: 1.0)'));
  });

  it('should encode RECON without a prio header', function () {
    var envelope = new proto.SyncRequest('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@sync(node: node_uri, lane: lane_uri)'));
  });

  it('should decode RECON with named headers', function () {
    var envelope = proto.parse('@sync(node: node_uri, lane: lane_uri, prio: 1.0)');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 1.0);
  });

  it('should decode RECON with positional headers', function () {
    var envelope = proto.parse('@sync(node_uri, lane_uri)');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@sync(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@sync(node_uri, lane_uri, bar)');
    assert(envelope.isSyncRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@sync()');
    assert(envelope === undefined);
  });
});


describe('@synced responses', function () {
  it('should have header properties', function () {
    var envelope = new proto.SyncedResponse('node_uri', 'lane_uri');
    assert(envelope.isSyncedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should encode RECON', function () {
    var envelope = new proto.SyncedResponse('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@synced(node: node_uri, lane: lane_uri)'));
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


describe('@link requests', function () {
  it('should have header properties', function () {
    var envelope = new proto.LinkRequest('node_uri', 'lane_uri', 1.0);
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 1.0);
  });

  it('should encode RECON with a prio header', function () {
    var envelope = new proto.LinkRequest('node_uri', 'lane_uri', 1.0);
    assert.same(envelope.encode(), recon.parse('@link(node: node_uri, lane: lane_uri, prio: 1.0)'));
  });

  it('should encode RECON without a prio header', function () {
    var envelope = new proto.LinkRequest('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@link(node: node_uri, lane: lane_uri)'));
  });

  it('should decode RECON with named headers', function () {
    var envelope = proto.parse('@link(node: node_uri, lane: lane_uri, prio: 1.0)');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 1.0);
  });

  it('should decode RECON with positional headers', function () {
    var envelope = proto.parse('@link(node_uri, lane_uri)');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@link(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@link(node_uri, lane_uri, bar)');
    assert(envelope.isLinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@link()');
    assert(envelope === undefined);
  });
});


describe('@linked responses', function () {
  it('should have header properties', function () {
    var envelope = new proto.LinkedResponse('node_uri', 'lane_uri', 1.0);
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 1.0);
  });

  it('should encode RECON with a prio header', function () {
    var envelope = new proto.LinkedResponse('node_uri', 'lane_uri', 1.0);
    assert.same(envelope.encode(), recon.parse('@linked(node: node_uri, lane: lane_uri, prio: 1.0)'));
  });

  it('should encode RECON without a prio header', function () {
    var envelope = new proto.LinkedResponse('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@linked(node: node_uri, lane: lane_uri)'));
  });

  it('should decode RECON with named headers', function () {
    var envelope = proto.parse('@linked(node: node_uri, lane: lane_uri, prio: 1.0)');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 1.0);
  });

  it('should decode RECON with positional headers', function () {
    var envelope = proto.parse('@linked(node_uri, lane_uri)');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
  });

  it('should decode RECON with named and unknown headers', function () {
    var envelope = proto.parse('@linked(node: node_uri, lane: lane_uri, foo: bar)');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
  });

  it('should decode RECON with positional and unknown headers', function () {
    var envelope = proto.parse('@linked(node_uri, lane_uri, bar)');
    assert(envelope.isLinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
    assert.same(envelope.prio, 0.0);
  });

  it('should not decode RECON with missing headers', function () {
    var envelope = proto.parse('@linked()');
    assert(envelope === undefined);
  });
});


describe('@unlink requests', function () {
  it('should have header properties', function () {
    var envelope = new proto.UnlinkRequest('node_uri', 'lane_uri');
    assert(envelope.isUnlinkRequest);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should encode RECON', function () {
    var envelope = new proto.UnlinkRequest('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@unlink(node: node_uri, lane: lane_uri)'));
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
    var envelope = new proto.UnlinkedResponse('node_uri', 'lane_uri');
    assert(envelope.isUnlinkedResponse);
    assert.same(envelope.node, 'node_uri');
    assert.same(envelope.lane, 'lane_uri');
  });

  it('should encode RECON', function () {
    var envelope = new proto.UnlinkedResponse('node_uri', 'lane_uri');
    assert.same(envelope.encode(), recon.parse('@unlinked(node: node_uri, lane: lane_uri)'));
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

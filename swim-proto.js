'use strict';

var config = require('./config.json');
var recon = require('recon-js');

function decode(record) {
  switch (recon.tag(record)) {
    case '@event': return EventMessage.decode(record);
    case '@command': return CommandMessage.decode(record);
    case '@sync': return SyncRequest.decode(record);
    case '@synced': return SyncedResponse.decode(record);
    case '@link': return LinkRequest.decode(record);
    case '@linked': return LinkedResponse.decode(record);
    case '@unlink': return UnlinkRequest.decode(record);
    case '@unlinked': return UnlinkedResponse.decode(record);
  }
}

function encode(envelope) {
  return envelope.encode();
}

function parse(string) {
  return decode(recon.parse(string));
}

function stringify(envelope) {
  return recon.stringify(encode(envelope));
}


function Envelope() {}
Object.defineProperty(Envelope.prototype, 'isRequest', {value: false});
Object.defineProperty(Envelope.prototype, 'isResponse', {value: false});
Object.defineProperty(Envelope.prototype, 'isMessage', {value: false});
Object.defineProperty(Envelope.prototype, 'isEventMessage', {value: false});
Object.defineProperty(Envelope.prototype, 'isCommandMessage', {value: false});
Object.defineProperty(Envelope.prototype, 'isSyncRequest', {value: false});
Object.defineProperty(Envelope.prototype, 'isSyncedResponse', {value: false});
Object.defineProperty(Envelope.prototype, 'isLinkRequest', {value: false});
Object.defineProperty(Envelope.prototype, 'isLinkedResponse', {value: false});
Object.defineProperty(Envelope.prototype, 'isUnlinkRequest', {value: false});
Object.defineProperty(Envelope.prototype, 'isUnlinkedResponse', {value: false});


function RequestEnvelope() {
  Envelope.call(this);
}
RequestEnvelope.prototype = Object.create(Envelope.prototype);
RequestEnvelope.prototype.constructor = RequestEnvelope;
Object.defineProperty(RequestEnvelope.prototype, 'isRequest', {value: true});


function ResponseEnvelope() {
  Envelope.call(this);
}
ResponseEnvelope.prototype = Object.create(Envelope.prototype);
ResponseEnvelope.prototype.constructor = ResponseEnvelope;
Object.defineProperty(RequestEnvelope.prototype, 'isResponse', {value: true});


function MessageEnvelope() {
  Envelope.call(this);
}
MessageEnvelope.prototype = Object.create(Envelope.prototype);
MessageEnvelope.prototype.constructor = MessageEnvelope;
Object.defineProperty(RequestEnvelope.prototype, 'isMessage', {value: true});


function EventMessage(node, lane, via, body) {
  MessageEnvelope.call(this);
  this.node = node;
  this.lane = lane;
  this.via = via;
  this.body = body;
}
EventMessage.prototype = Object.create(MessageEnvelope.prototype);
EventMessage.prototype.constructor = EventMessage;
Object.defineProperty(EventMessage.prototype, 'isEventMessage', {value: true});
EventMessage.prototype.encode = function () {
  var headers = [{node: this.node}, {lane: this.lane}];
  if (this.via) headers.push({via: this.via});
  return recon.concat({'@event': headers}, this.body);
};
EventMessage.decode = function (record) {
  var node, lane, via;
  var body = recon.tail(record);
  var headers = recon.head(record);
  var n = headers && headers.length || 0;
  for (var i = 0; i < n; i += 1) {
    var header = headers[i];
    if (header.node !== undefined) node = header.node;
    else if (header.lane !== undefined) lane = header.lane;
    else if (header.via !== undefined) via = header.via;
    else if (i === 0) node = header;
    else if (i === 1) lane = header;
    else if (i === 2) via = header;
  }
  if (node !== undefined && lane !== undefined) {
    return new EventMessage(node, lane, via, body);
  }
};


function CommandMessage(node, lane, via, body) {
  MessageEnvelope.call(this);
  this.node = node;
  this.lane = lane;
  this.via = via;
  this.body = body;
}
CommandMessage.prototype = Object.create(MessageEnvelope.prototype);
CommandMessage.prototype.constructor = CommandMessage;
Object.defineProperty(CommandMessage.prototype, 'isCommandMessage', {value: true});
CommandMessage.prototype.encode = function () {
  var headers = [{node: this.node}, {lane: this.lane}];
  if (this.via) headers.push({via: this.via});
  return recon.concat({'@command': headers}, this.body);
};
CommandMessage.decode = function (record) {
  var node, lane, via;
  var body = recon.tail(record);
  var headers = recon.head(record);
  var n = headers && headers.length || 0;
  for (var i = 0; i < n; i += 1) {
    var header = headers[i];
    if (header.node !== undefined) node = header.node;
    else if (header.lane !== undefined) lane = header.lane;
    else if (header.via !== undefined) via = header.via;
    else if (i === 0) node = header;
    else if (i === 1) lane = header;
    else if (i === 2) via = header;
  }
  if (node !== undefined && lane !== undefined) {
    return new CommandMessage(node, lane, via, body);
  }
};


function SyncRequest(node, lane, prio) {
  RequestEnvelope.call(this);
  this.node = node;
  this.lane = lane;
  this.prio = prio || 0.0;
}
SyncRequest.prototype = Object.create(RequestEnvelope.prototype);
SyncRequest.prototype.constructor = SyncRequest;
Object.defineProperty(SyncRequest.prototype, 'isSyncRequest', {value: true});
SyncRequest.prototype.encode = function () {
  var headers = [{node: this.node}, {lane: this.lane}];
  if (this.prio) headers.push({prio: this.prio});
  return recon({'@sync': headers});
};
SyncRequest.decode = function (record) {
  var node, lane, prio;
  var headers = recon.head(record);
  var n = headers && headers.length || 0;
  for (var i = 0; i < n; i += 1) {
    var header = headers[i];
    if (header.node !== undefined) node = header.node;
    else if (header.lane !== undefined) lane = header.lane;
    else if (header.prio !== undefined) prio = header.prio;
    else if (i === 0) node = header;
    else if (i === 1) lane = header;
  }
  if (node !== undefined && lane !== undefined) {
    return new SyncRequest(node, lane, prio);
  }
};


function SyncedResponse(node, lane) {
  ResponseEnvelope.call(this);
  this.node = node;
  this.lane = lane;
}
SyncedResponse.prototype = Object.create(ResponseEnvelope.prototype);
SyncedResponse.prototype.constructor = SyncedResponse;
Object.defineProperty(SyncedResponse.prototype, 'isSyncedResponse', {value: true});
SyncedResponse.prototype.encode = function () {
  var headers = [{node: this.node}, {lane: this.lane}];
  return recon({'@synced': headers});
};
SyncedResponse.decode = function (record) {
  var node, lane;
  var headers = recon.head(record);
  var n = headers && headers.length || 0;
  for (var i = 0; i < n; i += 1) {
    var header = headers[i];
    if (header.node !== undefined) node = header.node;
    else if (header.lane !== undefined) lane = header.lane;
    else if (i === 0) node = header;
    else if (i === 1) lane = header;
  }
  if (node !== undefined && lane !== undefined) {
    return new SyncedResponse(node, lane);
  }
};


function LinkRequest(node, lane, prio) {
  RequestEnvelope.call(this);
  this.node = node;
  this.lane = lane;
  this.prio = prio || 0.0;
}
LinkRequest.prototype = Object.create(RequestEnvelope.prototype);
LinkRequest.prototype.constructor = LinkRequest;
Object.defineProperty(LinkRequest.prototype, 'isLinkRequest', {value: true});
LinkRequest.prototype.encode = function () {
  var headers = [{node: this.node}, {lane: this.lane}];
  if (this.prio) headers.push({prio: this.prio});
  return recon({'@link': headers});
};
LinkRequest.decode = function (record) {
  var node, lane, prio;
  var headers = recon.head(record);
  var n = headers && headers.length || 0;
  for (var i = 0; i < n; i += 1) {
    var header = headers[i];
    if (header.node !== undefined) node = header.node;
    else if (header.lane !== undefined) lane = header.lane;
    else if (header.prio !== undefined) prio = header.prio;
    else if (i === 0) node = header;
    else if (i === 1) lane = header;
  }
  if (node !== undefined && lane !== undefined) {
    return new LinkRequest(node, lane, prio);
  }
};


function LinkedResponse(node, lane, prio) {
  ResponseEnvelope.call(this);
  this.node = node;
  this.lane = lane;
  this.prio = prio || 0.0;
}
LinkedResponse.prototype = Object.create(ResponseEnvelope.prototype);
LinkedResponse.prototype.constructor = LinkedResponse;
Object.defineProperty(LinkedResponse.prototype, 'isLinkedResponse', {value: true});
LinkedResponse.prototype.encode = function () {
  var headers = [{node: this.node}, {lane: this.lane}];
  if (this.prio) headers.push({prio: this.prio});
  return recon({'@linked': headers});
};
LinkedResponse.decode = function (record) {
  var node, lane, prio;
  var headers = recon.head(record);
  var n = headers && headers.length || 0;
  for (var i = 0; i < n; i += 1) {
    var header = headers[i];
    if (header.node !== undefined) node = header.node;
    else if (header.lane !== undefined) lane = header.lane;
    else if (header.prio !== undefined) prio = header.prio;
    else if (i === 0) node = header;
    else if (i === 1) lane = header;
  }
  if (node !== undefined && lane !== undefined) {
    return new LinkedResponse(node, lane, prio);
  }
};


function UnlinkRequest(node, lane) {
  RequestEnvelope.call(this);
  this.node = node;
  this.lane = lane;
}
UnlinkRequest.prototype = Object.create(RequestEnvelope.prototype);
UnlinkRequest.prototype.constructor = UnlinkRequest;
Object.defineProperty(UnlinkRequest.prototype, 'isUnlinkRequest', {value: true});
UnlinkRequest.prototype.encode = function () {
  var headers = [{node: this.node}, {lane: this.lane}];
  return recon({'@unlink': headers});
};
UnlinkRequest.decode = function (record) {
  var node, lane;
  var headers = recon.head(record);
  var n = headers && headers.length || 0;
  for (var i = 0; i < n; i += 1) {
    var header = headers[i];
    if (header.node !== undefined) node = header.node;
    else if (header.lane !== undefined) lane = header.lane;
    else if (i === 0) node = header;
    else if (i === 1) lane = header;
  }
  if (node !== undefined && lane !== undefined) {
    return new UnlinkRequest(node, lane);
  }
};


function UnlinkedResponse(node, lane) {
  ResponseEnvelope.call(this);
  this.node = node;
  this.lane = lane;
}
UnlinkedResponse.prototype = Object.create(ResponseEnvelope.prototype);
UnlinkedResponse.prototype.constructor = UnlinkedResponse;
Object.defineProperty(UnlinkedResponse.prototype, 'isUnlinkedResponse', {value: true});
UnlinkedResponse.prototype.encode = function () {
  var headers = [{node: this.node}, {lane: this.lane}];
  return recon({'@unlinked': headers});
};
UnlinkedResponse.decode = function (record) {
  var node, lane;
  var headers = recon.head(record);
  var n = headers && headers.length || 0;
  for (var i = 0; i < n; i += 1) {
    var header = headers[i];
    if (header.node !== undefined) node = header.node;
    else if (header.lane !== undefined) lane = header.lane;
    else if (i === 0) node = header;
    else if (i === 1) lane = header;
  }
  if (node !== undefined && lane !== undefined) {
    return new UnlinkedResponse(node, lane);
  }
};


exports.decode = decode;
exports.encode = encode;
exports.parse = parse;
exports.stringify = stringify;
exports.Envelope = Envelope;
exports.RequestEnvelope = RequestEnvelope;
exports.ResponseEnvelope = ResponseEnvelope;
exports.MessageEnvelope = MessageEnvelope;
exports.EventMessage = EventMessage;
exports.CommandMessage = CommandMessage;
exports.SyncRequest = SyncRequest;
exports.SyncedResponse = SyncedResponse;
exports.LinkRequest = LinkRequest;
exports.LinkedResponse = LinkedResponse;
exports.UnlinkRequest = UnlinkRequest;
exports.UnlinkedResponse = UnlinkedResponse;
exports.config = config;

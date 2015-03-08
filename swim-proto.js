'use strict';

var recon = require('recon-js');


function decode(record) {
  if (typeof record === 'string') record = recon.parse(record);
  switch (record.head().key) {
    case 'event': return EventMessage.decode(record);
    case 'command': return CommandMessage.decode(record);
    case 'send': return SendMessage.decode(record);
    case 'link': return LinkRequest.decode(record);
    case 'linked': return LinkedResponse.decode(record);
    case 'unlink': return UnlinkRequest.decode(record);
    case 'unlinked': return UnlinkedResponse.decode(record);
    case 'get': return GetRequest.decode(record);
    case 'put': return PutRequest.decode(record);
  }
}


function Envelope() {}
Object.defineProperty(Envelope.prototype, 'isRequest', {value: false});
Object.defineProperty(Envelope.prototype, 'isResponse', {value: false});
Object.defineProperty(Envelope.prototype, 'isMessage', {value: false});
Object.defineProperty(Envelope.prototype, 'isEventMessage', {value: false});
Object.defineProperty(Envelope.prototype, 'isCommandMessage', {value: false});
Object.defineProperty(Envelope.prototype, 'isSendMessage', {value: false});
Object.defineProperty(Envelope.prototype, 'isSendEventMessage', {value: false});
Object.defineProperty(Envelope.prototype, 'isSendCommandMessage', {value: false});
Object.defineProperty(Envelope.prototype, 'isLinkRequest', {value: false});
Object.defineProperty(Envelope.prototype, 'isLinkedResponse', {value: false});
Object.defineProperty(Envelope.prototype, 'isUnlinkRequest', {value: false});
Object.defineProperty(Envelope.prototype, 'isUnlinkedResponse', {value: false});
Object.defineProperty(Envelope.prototype, 'isGetRequest', {value: false});
Object.defineProperty(Envelope.prototype, 'isPutRequest', {value: false});


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


function EventMessage(channel, via, node, lane, body) {
  MessageEnvelope.call(this);
  Object.defineProperty(this, 'channel', {enumerable: true, value: channel || recon.extant});
  Object.defineProperty(this, 'via', {enumerable: true, value: via || recon.absent});
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
  Object.defineProperty(this, 'body', {enumerable: true, value: body || recon.empty()});
}
EventMessage.prototype = Object.create(MessageEnvelope.prototype);
EventMessage.prototype.constructor = EventMessage;
Object.defineProperty(EventMessage.prototype, 'isEventMessage', {value: true});
EventMessage.prototype.encode = function () {
  var builder = recon.builder();
  builder.attr('event', this.channel);
  if (!this.via.isAbsent) builder.attr('via', this.via);
  builder.attr('node', this.node);
  builder.attr('lane', this.lane);
  builder.appendRecord(this.body);
  return builder.state();
};
EventMessage.decode = function (record) {
  var items = record.iterator();
  var channel = recon.extant;
  var via = recon.absent;
  var node = recon.absent;
  var lane = recon.absent;
  header: while (!items.isEmpty()) {
    var item = items.head();
    switch (item.key) {
      case 'event': channel = item.value; break;
      case 'via': via = item.value; break;
      case 'node': node = item.value; break;
      case 'lane': lane = item.value; break;
      default: break header;
    }
    items.step();
  }
  var body = items.toRecord();
  return new EventMessage(channel, via, node, lane, body);
};


function CommandMessage(channel, via, node, lane, body) {
  MessageEnvelope.call(this);
  Object.defineProperty(this, 'channel', {enumerable: true, value: channel || recon.extant});
  Object.defineProperty(this, 'via', {enumerable: true, value: via || recon.absent});
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
  Object.defineProperty(this, 'body', {enumerable: true, value: body || recon.empty()});
}
CommandMessage.prototype = Object.create(MessageEnvelope.prototype);
CommandMessage.prototype.constructor = CommandMessage;
Object.defineProperty(CommandMessage.prototype, 'isCommandMessage', {value: true});
CommandMessage.prototype.encode = function () {
  var builder = recon.builder();
  builder.attr('command', this.channel);
  if (!this.via.isAbsent) builder.attr('via', this.via);
  builder.attr('node', this.node);
  builder.attr('lane', this.lane);
  builder.appendRecord(this.body);
  return builder.state();
};
CommandMessage.decode = function (record) {
  var items = record.iterator();
  var channel = recon.extant;
  var via = recon.absent;
  var node = recon.absent;
  var lane = recon.absent;
  header: while (!items.isEmpty()) {
    var item = items.head();
    switch (item.key) {
      case 'command': channel = item.value; break;
      case 'via': via = item.value; break;
      case 'node': node = item.value; break;
      case 'lane': lane = item.value; break;
      default: break header;
    }
    items.step();
  }
  var body = items.toRecord();
  return new CommandMessage(channel, via, node, lane, body);
};


function SendMessage() {
  MessageEnvelope.call(this);
}
SendMessage.prototype = Object.create(MessageEnvelope.prototype);
SendMessage.prototype.constructor = SendMessage;
Object.defineProperty(SendMessage.prototype, 'isSendMessage', {value: true});
SendMessage.decode = function (record) {
  switch (record(1).key) {
    case 'event': return SendEventMessage.decode(record);
    case 'command': return SendCommandMessage.decode(record);
  }
};


function SendEventMessage(channel, via, node, lane, body) {
  SendMessage.call(this);
  Object.defineProperty(this, 'channel', {enumerable: true, value: channel || recon.extant});
  Object.defineProperty(this, 'via', {enumerable: true, value: via || recon.absent});
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
  Object.defineProperty(this, 'body', {enumerable: true, value: body || recon.empty()});
}
SendEventMessage.prototype = Object.create(SendMessage.prototype);
SendEventMessage.prototype.constructor = SendEventMessage;
Object.defineProperty(SendEventMessage.prototype, 'isSendEventMessage', {value: true});
SendEventMessage.prototype.encode = function () {
  var builder = recon.builder();
  builder.attr('send');
  builder.attr('event', this.channel);
  if (!this.via.isAbsent) builder.attr('via', this.via);
  builder.attr('node', this.node);
  builder.attr('lane', this.lane);
  builder.appendRecord(this.body);
  return builder.state();
};
SendEventMessage.decode = function (record) {
  var items = record.iterator();
  var channel = recon.extant;
  var via = recon.absent;
  var node = recon.absent;
  var lane = recon.absent;
  header: while (!items.isEmpty()) {
    var item = items.head();
    switch (item.key) {
      case 'send': break;
      case 'event': channel = item.value; break;
      case 'via': via = item.value; break;
      case 'node': node = item.value; break;
      case 'lane': lane = item.value; break;
      default: break header;
    }
    items.step();
  }
  var body = items.toRecord();
  return new SendEventMessage(channel, via, node, lane, body);
};


function SendCommandMessage(channel, via, node, lane, body) {
  SendMessage.call(this);
  Object.defineProperty(this, 'channel', {enumerable: true, value: channel || recon.extant});
  Object.defineProperty(this, 'via', {enumerable: true, value: via || recon.absent});
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
  Object.defineProperty(this, 'body', {enumerable: true, value: body || recon.empty()});
}
SendCommandMessage.prototype = Object.create(SendMessage.prototype);
SendCommandMessage.prototype.constructor = SendCommandMessage;
Object.defineProperty(SendCommandMessage.prototype, 'isSendCommandMessage', {value: true});
SendCommandMessage.prototype.encode = function () {
  var builder = recon.builder();
  builder.attr('send');
  builder.attr('command', this.channel);
  if (!this.via.isAbsent) builder.attr('via', this.via);
  builder.attr('node', this.node);
  builder.attr('lane', this.lane);
  builder.appendRecord(this.body);
  return builder.state();
};
SendCommandMessage.decode = function (record) {
  var items = record.iterator();
  var channel = recon.extant;
  var via = recon.absent;
  var node = recon.absent;
  var lane = recon.absent;
  header: while (!items.isEmpty()) {
    var item = items.head();
    switch (item.key) {
      case 'send': break;
      case 'command': channel = item.value; break;
      case 'via': via = item.value; break;
      case 'node': node = item.value; break;
      case 'lane': lane = item.value; break;
      default: break header;
    }
    items.step();
  }
  var body = items.toRecord();
  return new SendCommandMessage(channel, via, node, lane, body);
};


function LinkRequest(channel, node, lane) {
  RequestEnvelope.call(this);
  Object.defineProperty(this, 'channel', {enumerable: true, value: channel || recon.extant});
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
}
LinkRequest.prototype = Object.create(RequestEnvelope.prototype);
LinkRequest.prototype.constructor = LinkRequest;
Object.defineProperty(LinkRequest.prototype, 'isLinkRequest', {value: true});
LinkRequest.prototype.encode = function () {
  return recon(
    recon.attr('link', this.channel),
    recon.attr('node', this.node),
    recon.attr('lane', this.lane));
};
LinkRequest.decode = function (record) {
  var items = record.iterator();
  var channel = recon.extant;
  var node = recon.absent;
  var lane = recon.absent;
  while (!items.isEmpty()) {
    var item = items.next();
    switch (item.key) {
      case 'link': channel = item.value; break;
      case 'node': node = item.value; break;
      case 'lane': lane = item.value; break;
    }
  }
  return new LinkRequest(channel, node, lane);
};


function LinkedResponse(channel, node, lane) {
  ResponseEnvelope.call(this);
  Object.defineProperty(this, 'channel', {enumerable: true, value: channel || recon.extant});
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
}
LinkedResponse.prototype = Object.create(ResponseEnvelope.prototype);
LinkedResponse.prototype.constructor = LinkedResponse;
Object.defineProperty(LinkedResponse.prototype, 'isLinkedResponse', {value: true});
LinkedResponse.prototype.encode = function () {
  return recon(
    recon.attr('linked', this.channel),
    recon.attr('node', this.node),
    recon.attr('lane', this.lane));
};
LinkedResponse.decode = function (record) {
  var items = record.iterator();
  var channel = recon.extant;
  var node = recon.absent;
  var lane = recon.absent;
  while (!items.isEmpty()) {
    var item = items.next();
    switch (item.key) {
      case 'linked': channel = item.value; break;
      case 'node': node = item.value; break;
      case 'lane': lane = item.value; break;
    }
  }
  return new LinkedResponse(channel, node, lane);
};


function UnlinkRequest(channel, node, lane) {
  RequestEnvelope.call(this);
  Object.defineProperty(this, 'channel', {enumerable: true, value: channel || recon.extant});
  Object.defineProperty(this, 'node', {enumerable: true, value: node || recon.absent});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane || recon.absent});
}
UnlinkRequest.prototype = Object.create(RequestEnvelope.prototype);
UnlinkRequest.prototype.constructor = UnlinkRequest;
Object.defineProperty(UnlinkRequest.prototype, 'isUnlinkRequest', {value: true});
UnlinkRequest.prototype.encode = function () {
  var builder = recon.builder();
  builder.attr('unlink', this.channel);
  if (!this.node.isAbsent) builder.attr('node', this.node);
  if (!this.lane.isAbsent) builder.attr('lane', this.lane);
  return builder.state();
};
UnlinkRequest.decode = function (record) {
  var items = record.iterator();
  var channel = recon.extant;
  var node = recon.absent;
  var lane = recon.absent;
  while (!items.isEmpty()) {
    var item = items.next();
    switch (item.key) {
      case 'unlink': channel = item.value; break;
      case 'node': node = item.value; break;
      case 'lane': lane = item.value; break;
    }
  }
  return new UnlinkRequest(channel, node, lane);
};


function UnlinkedResponse(channel, node, lane) {
  ResponseEnvelope.call(this);
  Object.defineProperty(this, 'channel', {enumerable: true, value: channel || recon.extant});
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
}
UnlinkedResponse.prototype = Object.create(ResponseEnvelope.prototype);
UnlinkedResponse.prototype.constructor = UnlinkedResponse;
Object.defineProperty(UnlinkedResponse.prototype, 'isUnlinkedResponse', {value: true});
UnlinkedResponse.prototype.encode = function () {
  return recon(
    recon.attr('unlinked', this.channel),
    recon.attr('node', this.node),
    recon.attr('lane', this.lane));
};
UnlinkedResponse.decode = function (record) {
  var items = record.iterator();
  var channel = recon.extant;
  var node = recon.absent;
  var lane = recon.absent;
  while (!items.isEmpty()) {
    var item = items.next();
    switch (item.key) {
      case 'unlinked': channel = item.value; break;
      case 'node': node = item.value; break;
      case 'lane': lane = item.value; break;
    }
  }
  return new UnlinkedResponse(channel, node, lane);
};


function GetRequest(channel, node) {
  RequestEnvelope.call(this);
  Object.defineProperty(this, 'channel', {enumerable: true, value: channel || recon.extant});
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
}
GetRequest.prototype = Object.create(RequestEnvelope.prototype);
GetRequest.prototype.constructor = GetRequest;
Object.defineProperty(GetRequest.prototype, 'isGetRequest', {value: true});
GetRequest.prototype.encode = function () {
  return recon(
    recon.attr('get', this.channel),
    recon.attr('node', this.node));
};
GetRequest.decode = function (record) {
  var items = record.iterator();
  var channel = recon.extant;
  var node = recon.absent;
  while (!items.isEmpty()) {
    var item = items.next();
    switch (item.key) {
      case 'get': channel = item.value; break;
      case 'node': node = item.value; break;
    }
  }
  return new GetRequest(channel, node);
};


function PutRequest(channel, node, body) {
  RequestEnvelope.call(this);
  Object.defineProperty(this, 'channel', {enumerable: true, value: channel || recon.extant});
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'body', {enumerable: true, value: body || recon.empty()});
}
PutRequest.prototype = Object.create(RequestEnvelope.prototype);
PutRequest.prototype.constructor = PutRequest;
Object.defineProperty(PutRequest.prototype, 'isPutRequest', {value: true});
PutRequest.prototype.encode = function () {
  var builder = recon.builder();
  builder.attr('put', this.channel);
  builder.attr('node', this.node);
  builder.appendRecord(this.body);
  return builder.state();
};
PutRequest.decode = function (record) {
  var items = record.iterator();
  var channel = recon.extant;
  var node = recon.absent;
  header: while (!items.isEmpty()) {
    var item = items.head();
    switch (item.key) {
      case 'put': channel = item.value; break;
      case 'node': node = item.value; break;
      default: break header;
    }
    items.step();
  }
  var body = items.toRecord();
  return new PutRequest(channel, node, body);
};


exports.decode = decode;
exports.Envelope = Envelope;
exports.RequestEnvelope = RequestEnvelope;
exports.ResponseEnvelope = ResponseEnvelope;
exports.MessageEnvelope = MessageEnvelope;
exports.EventMessage = EventMessage;
exports.CommandMessage = CommandMessage;
exports.SendMessage = SendMessage;
exports.SendEventMessage = SendEventMessage;
exports.SendCommandMessage = SendCommandMessage;
exports.LinkRequest = LinkRequest;
exports.LinkedResponse = LinkedResponse;
exports.UnlinkRequest = UnlinkRequest;
exports.UnlinkedResponse = UnlinkedResponse;
exports.GetRequest = GetRequest;
exports.PutRequest = PutRequest;

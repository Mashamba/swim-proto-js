'use strict';

var recon = require('recon-js');

function decode(record) {
  if (record.isRecord) {
    var heading = record.head();
    if (heading.isField) switch (heading.key) {
      case 'event': return EventMessage.decode(record);
      case 'command': return CommandMessage.decode(record);
      case 'sync': return SyncRequest.decode(record);
      case 'synced': return SyncedResponse.decode(record);
      case 'link': return LinkRequest.decode(record);
      case 'linked': return LinkedResponse.decode(record);
      case 'unlink': return UnlinkRequest.decode(record);
      case 'unlinked': return UnlinkedResponse.decode(record);
      case 'get': return GetRequest.decode(record);
      case 'put': return PutRequest.decode(record);
      case 'state': return StateResponse.decode(record);
    }
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
Object.defineProperty(Envelope.prototype, 'isGetRequest', {value: false});
Object.defineProperty(Envelope.prototype, 'isPutRequest', {value: false});
Object.defineProperty(Envelope.prototype, 'isStateResponse', {value: false});


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
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
  Object.defineProperty(this, 'via', {enumerable: true, value: via || recon.absent});
  Object.defineProperty(this, 'body', {enumerable: true, value: body || recon.empty()});
}
EventMessage.prototype = Object.create(MessageEnvelope.prototype);
EventMessage.prototype.constructor = EventMessage;
Object.defineProperty(EventMessage.prototype, 'isEventMessage', {value: true});
EventMessage.prototype.encode = function () {
  var builder = recon.builder();
  var heading = recon.builder();
  heading.slot('node', this.node);
  heading.slot('lane', this.lane);
  if (!this.via.isAbsent) heading.slot('via', this.via);
  builder.attr('event', heading.state());
  builder.appendRecord(this.body);
  return builder.state();
};
EventMessage.decode = function (record) {
  var node = '';
  var lane = '';
  var via = recon.absent;
  var body = record.tail();
  var heading = record.head();
  if (heading.value.isRecord) {
    var headers = heading.value.iterator();
    var i = 0;
    while (!headers.isEmpty()) {
      var header = headers.next();
      if (header.isField) switch (header.key) {
        case 'node': node = header.value; break;
        case 'lane': lane = header.value; break;
        case 'via': via = header.value; break;
      }
      else switch (i) {
        case 0: node = header; break;
        case 1: lane = header; break;
        case 2: via = header; break;
      }
      i += 1;
    }
  }
  return new EventMessage(node, lane, via, body);
};


function CommandMessage(node, lane, via, body) {
  MessageEnvelope.call(this);
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
  Object.defineProperty(this, 'via', {enumerable: true, value: via || recon.absent});
  Object.defineProperty(this, 'body', {enumerable: true, value: body || recon.empty()});
}
CommandMessage.prototype = Object.create(MessageEnvelope.prototype);
CommandMessage.prototype.constructor = CommandMessage;
Object.defineProperty(CommandMessage.prototype, 'isCommandMessage', {value: true});
CommandMessage.prototype.encode = function () {
  var builder = recon.builder();
  var heading = recon.builder();
  heading.slot('node', this.node);
  heading.slot('lane', this.lane);
  if (!this.via.isAbsent) heading.slot('via', this.via);
  builder.attr('command', heading.state());
  builder.appendRecord(this.body);
  return builder.state();
};
CommandMessage.decode = function (record) {
  var node = '';
  var lane = '';
  var via = recon.absent;
  var body = record.tail();
  var heading = record.head();
  if (heading.value.isRecord) {
    var headers = heading.value.iterator();
    var i = 0;
    while (!headers.isEmpty()) {
      var header = headers.next();
      if (header.isField) switch (header.key) {
        case 'node': node = header.value; break;
        case 'lane': lane = header.value; break;
        case 'via': via = header.value; break;
      }
      else switch (i) {
        case 0: node = header; break;
        case 1: lane = header; break;
        case 2: via = header; break;
      }
      i += 1;
    }
  }
  return new CommandMessage(node, lane, via, body);
};


function SyncRequest(node, lane) {
  RequestEnvelope.call(this);
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
}
SyncRequest.prototype = Object.create(RequestEnvelope.prototype);
SyncRequest.prototype.constructor = SyncRequest;
Object.defineProperty(SyncRequest.prototype, 'isSyncRequest', {value: true});
SyncRequest.prototype.encode = function () {
  return recon(
    recon.attr('sync', recon(
      recon.slot('node', this.node),
      recon.slot('lane', this.lane))));
};
SyncRequest.decode = function (record) {
  var node = '';
  var lane = '';
  var heading = record.head();
  if (heading.value.isRecord) {
    var headers = heading.value.iterator();
    var i = 0;
    while (!headers.isEmpty()) {
      var header = headers.next();
      if (header.isField) switch (header.key) {
        case 'node': node = header.value; break;
        case 'lane': lane = header.value; break;
      }
      else switch (i) {
        case 0: node = header; break;
        case 1: lane = header; break;
      }
      i += 1;
    }
  }
  return new SyncRequest(node, lane);
};


function SyncedResponse(node, lane) {
  ResponseEnvelope.call(this);
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
}
SyncedResponse.prototype = Object.create(ResponseEnvelope.prototype);
SyncedResponse.prototype.constructor = SyncedResponse;
Object.defineProperty(SyncedResponse.prototype, 'isSyncedResponse', {value: true});
SyncedResponse.prototype.encode = function () {
  return recon(
    recon.attr('synced', recon(
      recon.slot('node', this.node),
      recon.slot('lane', this.lane))));
};
SyncedResponse.decode = function (record) {
  var node = '';
  var lane = '';
  var heading = record.head();
  if (heading.value.isRecord) {
    var headers = heading.value.iterator();
    var i = 0;
    while (!headers.isEmpty()) {
      var header = headers.next();
      if (header.isField) switch (header.key) {
        case 'node': node = header.value; break;
        case 'lane': lane = header.value; break;
      }
      else switch (i) {
        case 0: node = header; break;
        case 1: lane = header; break;
      }
      i += 1;
    }
  }
  return new SyncedResponse(node, lane);
};


function LinkRequest(node, lane) {
  RequestEnvelope.call(this);
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
}
LinkRequest.prototype = Object.create(RequestEnvelope.prototype);
LinkRequest.prototype.constructor = LinkRequest;
Object.defineProperty(LinkRequest.prototype, 'isLinkRequest', {value: true});
LinkRequest.prototype.encode = function () {
  return recon(
    recon.attr('link', recon(
      recon.slot('node', this.node),
      recon.slot('lane', this.lane))));
};
LinkRequest.decode = function (record) {
  var node = '';
  var lane = '';
  var heading = record.head();
  if (heading.value.isRecord) {
    var headers = heading.value.iterator();
    var i = 0;
    while (!headers.isEmpty()) {
      var header = headers.next();
      if (header.isField) switch (header.key) {
        case 'node': node = header.value; break;
        case 'lane': lane = header.value; break;
      }
      else switch (i) {
        case 0: node = header; break;
        case 1: lane = header; break;
      }
      i += 1;
    }
  }
  return new LinkRequest(node, lane);
};


function LinkedResponse(node, lane) {
  ResponseEnvelope.call(this);
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
}
LinkedResponse.prototype = Object.create(ResponseEnvelope.prototype);
LinkedResponse.prototype.constructor = LinkedResponse;
Object.defineProperty(LinkedResponse.prototype, 'isLinkedResponse', {value: true});
LinkedResponse.prototype.encode = function () {
  return recon(
    recon.attr('linked', recon(
      recon.slot('node', this.node),
      recon.slot('lane', this.lane))));
};
LinkedResponse.decode = function (record) {
  var node = '';
  var lane = '';
  var heading = record.head();
  if (heading.value.isRecord) {
    var headers = heading.value.iterator();
    var i = 0;
    while (!headers.isEmpty()) {
      var header = headers.next();
      if (header.isField) switch (header.key) {
        case 'node': node = header.value; break;
        case 'lane': lane = header.value; break;
      }
      else switch (i) {
        case 0: node = header; break;
        case 1: lane = header; break;
      }
      i += 1;
    }
  }
  return new LinkedResponse(node, lane);
};


function UnlinkRequest(node, lane) {
  RequestEnvelope.call(this);
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
}
UnlinkRequest.prototype = Object.create(RequestEnvelope.prototype);
UnlinkRequest.prototype.constructor = UnlinkRequest;
Object.defineProperty(UnlinkRequest.prototype, 'isUnlinkRequest', {value: true});
UnlinkRequest.prototype.encode = function () {
  return recon(
    recon.attr('unlink', recon(
      recon.slot('node', this.node),
      recon.slot('lane', this.lane))));
};
UnlinkRequest.decode = function (record) {
  var node = '';
  var lane = '';
  var heading = record.head();
  if (heading.value.isRecord) {
    var headers = heading.value.iterator();
    var i = 0;
    while (!headers.isEmpty()) {
      var header = headers.next();
      if (header.isField) switch (header.key) {
        case 'node': node = header.value; break;
        case 'lane': lane = header.value; break;
      }
      else switch (i) {
        case 0: node = header; break;
        case 1: lane = header; break;
      }
      i += 1;
    }
  }
  return new UnlinkRequest(node, lane);
};


function UnlinkedResponse(node, lane) {
  ResponseEnvelope.call(this);
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'lane', {enumerable: true, value: lane});
}
UnlinkedResponse.prototype = Object.create(ResponseEnvelope.prototype);
UnlinkedResponse.prototype.constructor = UnlinkedResponse;
Object.defineProperty(UnlinkedResponse.prototype, 'isUnlinkedResponse', {value: true});
UnlinkedResponse.prototype.encode = function () {
  return recon(
    recon.attr('unlinked', recon(
      recon.slot('node', this.node),
      recon.slot('lane', this.lane))));
};
UnlinkedResponse.decode = function (record) {
  var node = '';
  var lane = '';
  var heading = record.head();
  if (heading.value.isRecord) {
    var headers = heading.value.iterator();
    var i = 0;
    while (!headers.isEmpty()) {
      var header = headers.next();
      if (header.isField) switch (header.key) {
        case 'node': node = header.value; break;
        case 'lane': lane = header.value; break;
      }
      else switch (i) {
        case 0: node = header; break;
        case 1: lane = header; break;
      }
      i += 1;
    }
  }
  return new UnlinkedResponse(node, lane);
};


function GetRequest(node) {
  RequestEnvelope.call(this);
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
}
GetRequest.prototype = Object.create(RequestEnvelope.prototype);
GetRequest.prototype.constructor = GetRequest;
Object.defineProperty(GetRequest.prototype, 'isGetRequest', {value: true});
GetRequest.prototype.encode = function () {
  return recon(
    recon.attr('get', recon(
      recon.slot('node', this.node))));
};
GetRequest.decode = function (record) {
  var node = '';
  var heading = record.head();
  if (heading.value.isRecord) {
    var headers = heading.value.iterator();
    var i = 0;
    while (!headers.isEmpty()) {
      var header = headers.next();
      if (header.isField) switch (header.key) {
        case 'node': node = header.value; break;
      }
      else switch (i) {
        case 0: node = header; break;
      }
      i += 1;
    }
  }
  else if (!heading.value.isExtant) node = heading.value;
  return new GetRequest(node);
};


function PutRequest(node, body) {
  RequestEnvelope.call(this);
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'body', {enumerable: true, value: body || recon.empty()});
}
PutRequest.prototype = Object.create(RequestEnvelope.prototype);
PutRequest.prototype.constructor = PutRequest;
Object.defineProperty(PutRequest.prototype, 'isPutRequest', {value: true});
PutRequest.prototype.encode = function () {
  var builder = recon.builder();
  builder.attr('put', recon(
    recon.slot('node', this.node)));
  builder.appendRecord(this.body);
  return builder.state();
};
PutRequest.decode = function (record) {
  var node = '';
  var body = record.tail();
  var heading = record.head();
  if (heading.value.isRecord) {
    var headers = heading.value.iterator();
    var i = 0;
    while (!headers.isEmpty()) {
      var header = headers.next();
      if (header.isField) switch (header.key) {
        case 'node': node = header.value; break;
      }
      else switch (i) {
        case 0: node = header; break;
      }
      i += 1;
    }
  }
  else if (!heading.value.isExtant) node = heading.value;
  return new PutRequest(node, body);
};


function StateResponse(node, body) {
  ResponseEnvelope.call(this);
  Object.defineProperty(this, 'node', {enumerable: true, value: node});
  Object.defineProperty(this, 'body', {enumerable: true, value: body || recon.empty()});
}
StateResponse.prototype = Object.create(ResponseEnvelope.prototype);
StateResponse.prototype.constructor = StateResponse;
Object.defineProperty(StateResponse.prototype, 'isStateResponse', {value: true});
StateResponse.prototype.encode = function () {
  var builder = recon.builder();
  builder.attr('state', recon(
    recon.slot('node', this.node)));
  builder.appendRecord(this.body);
  return builder.state();
};
StateResponse.decode = function (record) {
  var node = '';
  var body = record.tail();
  var heading = record.head();
  if (heading.value.isRecord) {
    var headers = heading.value.iterator();
    var i = 0;
    while (!headers.isEmpty()) {
      var header = headers.next();
      if (header.isField) switch (header.key) {
        case 'node': node = header.value; break;
      }
      else switch (i) {
        case 0: node = header; break;
      }
      i += 1;
    }
  }
  else if (!heading.value.isExtant) node = heading.value;
  return new StateResponse(node, body);
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
exports.GetRequest = GetRequest;
exports.PutRequest = PutRequest;
exports.StateResponse = StateResponse;

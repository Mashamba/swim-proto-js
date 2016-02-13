# Swim Protocol JavaScript Implementation

## JavaScript Library

The Swim protocol library can be used in any standard JavaScript environment.
Use `npm` to incorporate the library into Node.js projects.

```
npm install --save swim-proto-js
```

```js
var proto = require('swim-proto-js');

var envelope = proto.parse('@event(node: "house#kitchen", lane: "light/on")');
proto.stringify(envelope);
```

## Protocol Envelopes

The Swim protocol defines a set of [RECON](https://github.com/web-aware/recon-js)
datatypes used for URI-linked multiplexed structural messaging.

### @event

Send an event message to a node on some lane, or receive an event
message that propagated through a linked node on a subscribed lane.
`node_uri` and `lane_uri` always refer to origin node and lane to which
the event was published.  `link_uris` enumerates all links the
event passed through prior to reaching the receiver.

```
<< @event([node:] <node_uri>, [lane:] <lane_uri>[, via: <link_uris>]) <body>
```

#### Examples

```
<< @event(node: "swim://iot.example.com/L01FE", lane: "light/off", via: "house#kitchen/light) {
  time: @date("2015-02-03T07:53:31-0800")
}

<< @event(node: "swim://iot.example.com/SD02FD", lane: "alarm/smoke", via: "house#garage/smoke_detector") {
  time: @data("2015-02-03T11:17:12-0800")
  concentration: 330 @ppm
  duration: 10 @seconds
}
```

### @command

Send a command message to a node on some lane, or receive a command
message that propagated through a linked node on a subscribed lane.
`node_uri` and `lane_uri` always refer to origin node and lane to which
the command was published.  `link_uris` enumerates all links the
command passed through prior to reaching the receiver.

```
<< @command([node:] <node_uri>, [lane:] <lane_uri>[, via: <link_uris>]) <body>
```

#### Examples

```
<< @command(node: "house#kitchen", lane: "light/on")

<< @command(node: "swim://town.example.com/fire_dept", lane: "alarm/silence", via: "house") {
  reason: "homeowner reported false alarm"
}
```

### @sync

Request a replay of events that have propagated through a node on some lane.
The receiver should respond with the minimum set of events necessary to
reconstruct the receiver's current state, as it pertains to the requested
message lane.

A @sync request establishes a corresponding link, if one doesn't already exist.

```
>> @sync([node:] <node_uri>, [lane:] <lane_uri>[, prio: <priority>])
<< @synced([node:] <node_uri>, [lane:] <lane_uri>)
```

#### Examples

```
>> @sync(node: "house", lane: "light/level", prio: 0.5)
<< @event(node: "house#kitchen", lane: "light/level") { level: 100 }
<< @event(node: "house#hallway", lane: "light/level") { level: 0 }
<< @synced(node: "house", lane: "light/level")
```

### @link

Subscribe to messages that flow through some node on some lane.

```
>> @link([node:] <node_uri>, [lane:] <lane_uri>[, prio: <priority>])
<< @linked([node:] <node_uri>, [lane:] <lane_uri>[, prio: <priority>])
```

#### Examples

```
>> @link("house#kitchen", "light")
<< @linked(node: "house#kitchen", lane: "light")

>> @link(node: "house", lane: "alarm", prio: 0.5)
<< @linked(node: "house", lane: "alarm", prio: 0.5)
```

### @unlink

Remove an existing message subscription identified by a
(`node_uri`, `lane_uri`) pair.

```
>> @unlink([node:] <node_uri>, [lane:] <lane_uri>)
<< @unlinked([node:] <node_uri>, [lane:] <lane_uri>)
```

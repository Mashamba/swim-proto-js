# Structural Web Integrated Messaging (SWIM) Protocol

[![Build Status](https://travis-ci.org/coeffect/swim-proto-js.svg?branch=master)](https://travis-ci.org/coeffect/swim-proto-js) [![Coveralls Status](http://img.shields.io/coveralls/coeffect/swim-proto-js/master.svg)](https://coveralls.io/r/coeffect/swim-proto-js)

## JavaScript Library

The SWIM protocol library can run in any standard JavaScript environment.
Use `npm` to incorporate the library into Node.js projects.

```
npm install --save swim-proto-js
```

```js
var proto = require('swim-proto-js');

var envelope = proto.decode('@event(node: "house#kitchen", lane: "light/on")');
```

## Protocol Envelopes

The SWIM protocol defines a set of [RECON](https://github.com/coeffect/recon-js)
datatypes for bridging multiplexed structural messaging endpoints.
The protocol library does not itself implement model-based message
propagation semantics.

### @link

Subscribe to messages that flow through a model node in some lane.

```
>> @link([node:] <node_uri>, [lane:] <lane_uri>)
<< @linked([node:] <node_uri>, [lane:] <lane_uri>)
```

#### Examples

```
>> @link("house#kitchen", "light")
<< @linked(node: "house#kitchen", lane: "light")

>> @link(node: "house", lane: "alarm")
<< @linked(node: "house", lane: "alarm")
```

### @unlink

Remove an existing message subscription identified by a
(`node_uri`, `lane_uri`) pair.

```
>> @unlink([node:] <node_uri>, [lane:] <lane_uri>)
<< @unlinked([node:] <node_uri>, [lane:] <lane_uri>)
```

#### Examples

```
>> @unlink("house#kitchen", "light")
<< @unlinked(node: "house#kitchen", lane: "light")

>> @unlink(node: "house", lane: "alarm")
<< @unlinked(node: "house", lane: "alarm")
```

### @event

Receive an event message that propagated through a linked model node on a
monitored lane.  `node_uri` and `lane_uri` refer to origin node and lane to
which the event was published.  `link_uris` enumerates all model links the
event passed through prior to reaching the receiver.

```
<< @event([node:] <node_uri>, [lane:] <lane_uri>, via: <link_uris>) <body>
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

Receive a command message that propagated through a linked model node on a
monitored lane.  `node_uri` and `lane_uri` refer to origin node and lane to
which the command was published.  `link_uris` enumerates all model links the
command passed through prior to reaching the receiver.

```
<< @command([@node:] <node_uri>, [lane:] <lane_uri>, via: <link_uris>) <body>
```

#### Examples

```
<< @command(node: "house#kitchen", lane: "light/on")

<< @command(node: "swim://town.example.com/fire_dept", lane: "alarm/silence", via: "house") {
  reason: "homeowner reported false alarm"
}
```

### @send

Publish a message to a model node on some lane.

```
>> @send @event([node:] <node_uri>, [lane:] <lane_uri>) <body>

>> @send @command([node:] <node_uri>, [lane:] <lane_uri>) <body>
```

#### Examples

```
>> @send @event(node: "house#kitchen", lane: "toaster/done") {
  items: 2
}

>> @send @command(node: "house#kitchen", lane: "light/on")
```

### @get

Fetch the model at `node_uri`.

```
>> @get([node:] <node_uri>)
<< @state([node:] <node_uri>) <body>
```

#### Examples

```
>> @get("house#kitchen")
<< @state(node: "house#kitchen") {
  light: @light @link("swim://iot.example.com/L01FE")
  toaster: @toaster @link("swim://iot.example.com/T03FC")
  kitchen_door: @door @ref("house#garage")
}

>> @get(node: "house#garage")
<< @state(node: "house#garage") {
  opener: @switch @link("swim://iot.example.com/GD04FB")
  kitchen_door: @door @ref("house#kitchen")
}
```

### @put

Update the model at `node_uri`.

```
>> @put([node:] <node_uri>) <body>
<< @state([node:] <node_uri>) <body>
```

#### Examples

```
>> @put(node: "house#garage") {
  smoke_detector: @alarm @link("swim://iot.example.com/SD02FD")
}
<< @state(node: "house#garage") {
  opener: @switch @link("swim://iot.example.com/GD04FB")
  kitchen_door: @door @ref("house#kitchen")
  smoke_detector: @alarm @link("swim://iot.example.com/SD02FD")
}
```

### @state

Receive a model state update.

```
<< @state([node:] <node_uri>) <body>
```

#### Examples

```
<< @state(node: "house") {
  living: @room {
    tv: @tv @link("swim://iot.example.com/TV05FA")
  }
}
```

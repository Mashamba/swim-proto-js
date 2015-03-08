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

var envelope = proto.decode('@event @node("house#kitchen") @lane("light/on")');
```

## Protocol Envelopes

The SWIM protocol defines a set of [RECON](https://github.com/coeffect/recon-js)
datatypes for bridging multiplexed structural messaging endpoints.
The protocol library does not itself implement model-based message
propagation semantics.

### @link

Subscribe to messages that flow through some model node in some lane.
Clients may optionally specify a `channel_key` to identify the attachment.

```recon
>> @link(<channel_key>) @node(<node_uri>) @lane(<lane_uri>)
<< @linked(<channel_key>) @node(<node_uri>) @lane(<lane_uri>)
```

#### Examples

```recon
>> @link @node("house#kitchen") @lane("light")
<< @linked @node("house#kitchen") @lane("light")

>> @link("alarms") @node("house") @lane("alarm")
<< @linked("alarms") @node("house") @lane("alarm")
```

### @unlink

Remove a message subscription identified by the client chosen `channel_key`,
or by a (`node_uri`, `lane_uri`) pair.

```recon
>> @unlink(<channel_key>) @node(<node_uri>) @lane(<lane_uri>)
<< @unlinked(<channel_key>) @node(<node_uri>) @lane(<lane_uri>)
```

#### Examples

```recon
>> @unlink @node("house#kitchen") @lane("light")
<< @unlinked @node("house#kitchen") @lane("light")

>> @unlink("alarms")
<< @unlinked("alarms") @node("house") @lane("alarm")
```

### @event

Receive an event message that propagated through a linked model node on a
monitored lane.  `channel_key` identifies the attachment that intercepted
the message.  `link_uris` enumerates all model links the event passed
through prior to reaching the receiver.  `node_uri` and `lane_uri` refer
to origin node and lane to which the event was published.

```recon
<< @event(<channel_key>) @via(<link_uris>) @node(<node_uri>) @lane(<lane_uri>) <body>
```

#### Examples

```recon
<< @event @via("house#kitchen/light") @node("swim://iot.example.com/L01FE") @lane("light/off") {
  time: @date("2015-02-03T07:53:31-0800")
}

<< @event("alarms") @via("house#garage/smoke_detector") @node("swim://iot.example.com/SD02FD") @lane("alarm/smoke") {
  time: @data("2015-02-03T11:17:12-0800")
  concentration: 330 @ppm
  duration: 10 @seconds
}
```

### @command

Receive a command message that propagated through a linked model node on a
monitored lane.  `channel_key` identifies the attachment that intercepted
the message.  `link_uris` enumerates all model links the command passed
through prior to reaching the receiver.  `node_uri` and `lane_uri` refer
to origin node and lane to which the command was published.

```recon
<< @command(<channel_key>) @via(<link_uris>) @node(<node_uri>) @lane(<lane_uri>) <body>
```

#### Examples

```recon
<< @command @node("house#kitchen") @lane("light/on")

<< @command("alarms") @node("house") @lane("alarm/silence") {
  reason: "false alarm"
}
```

### @send

Publish a message to some model node on some lane.  `channel_key` optionally
specifies a channel on which error messages may arrive.

```recon
>> @send @event(<channel_key>) @node(<node_uri>) @lane(<lane_uri>) <body>

>> @send @command(<channel_key>) @node(<node_uri>) @lane(<lane_uri>) <body>
```

#### Examples

```recon
>> @send @event @node("house#kitchen") @lane("toaster/done") {
  items: 2
}

>> @send @command @node("house#kitchen") @lane("light/on")
```

### @get

Fetch the model at `node_uri`.

```recon
>> @get(<channel_key>) @node(<node_uri>)
<< @result(<channel_key>) @node(<node_uri>) <body>
```

#### Examples

```recon
>> @get(1) @node("house#kitchen")
>> @get(2) @node("house#garage")

<< @result(2) @node("house#garage") {
  opener: @switch @link("swim://iot.example.com/GD04FB")
  kitchen_door: @door @ref("house#kitchen")
}
<< @result(1) @node("house#kitchen") {
  light: @light @link("swim://iot.example.com/L01FE")
  toaster: @toaster @link("swim://iot.example.com/T03FC")
  kitchen_door: @door @ref("house#garage")
}
```

### @put

Update the model at `node_uri`.

```recon
>> @put(<channel_key>) @node(<node_uri>) <body>
<< @result(<channel_key>) @node(<node_uri>) <body>
```

#### Examples

```recon
>> @put(3) @node("house#garage") {
  smoke_detector: @alarm @link("swim://iot.example.com/SD02FD")
}
<< @result(3) @node("house#garage") {
  opener: @switch @link("swim://iot.example.com/GD04FB")
  kitchen_door: @door @ref("house#kitchen")
  smoke_detector: @alarm @link("swim://iot.example.com/SD02FD")
}
```

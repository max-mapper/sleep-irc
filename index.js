var irc = require('irc')
var xtend = require('xtend')
var through = require('through2')
var debug = require('debug')('sleep-irc')

module.exports = function (opts) {
  var channels = opts.channel ? [opts.channel] : opts.channels
  if (!channels) throw new Error('you must specify channel/channels')

  var ircOpts = xtend({
    channels: channels,
    autoConnect: true,
    retryCount: 20
  }, opts.ircOpts)

  var ircClient = new irc.Client(
    opts.server || 'irc.freenode.net',
    opts.nick,
    ircOpts
  )

  var stream = through.obj()

  ircClient.on('error', function (message) {
    stream.destroy(message)
  })
  
  ircClient.on('abort', function (message) {
    stream.destroy(message)
  })
  
  channels.forEach(function (ch) {
    ircClient.on('message' + ch, function (from, message) {
      stream.push({date: new Date(), channel: ch, user: from, message: message})
    })
  })
  
  return stream
}

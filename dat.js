var dat = require('dat-core')
var pump = require('pump')
var through = require('through2')
var sleepIRC = require('./index.js')

var db = dat('./data', {createIfMissing: true, valueEncoding: 'json'})

var msgs = sleepIRC({
  channel: '#dat',
  nick: 'datlogbot'
})

var filter = through.obj(function (m, enc, next) {
  var key =  m.date.toISOString() + ' ' + m.channel // irc channel names can't have a space
  console.log(m.date.toISOString(), m.channel, '<' + m.user + '>', m.message)
  next(null, {type: 'put', value: m, key: key})
})

var write = db.createWriteStream({dataset: 'dat', message: '#dat irc messages'})

pump(msgs, filter, write, function (err) {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.error('pipeline exited without error!')
})

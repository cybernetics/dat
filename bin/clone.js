var abort = require('../lib/util/abort.js')
var usage = require('../lib/util/usage.js')('clone.txt')
var dat = require('..')
var fs = require('fs')
var rimraf = require('rimraf')
var replicate = require('../lib/replicate.js')

module.exports = {
  name: 'clone',
  command: handleClone
}

function handleClone (args) {
  if (args._.length === 0) return usage()
  var remote = args._[0]
  var path = args._[1] || getName(remote)
  args.path = path
  fs.stat(args.path, function (err, stat) {
    if (err) {
      if (err.code === 'ENOENT') fs.mkdirSync(args.path)
      else abort(err, args)
    }
    if (!err) abort(new Error('Error: destination path \'' + args.path + '\' already exists.'), args)

    var db = dat(args)
    replicate(db, remote, {mode: 'pull'}, function (err) {
      if (err) {
        if (err.code === 'ECONNREFUSED') return failure(err, args, 'Error: \'' + remote + '\' could not be reached.')
        return failure(err, args, 'Clone failed.')
      }
      console.error('Done!')
    })
  })
}

function getName (remote) {
  return remote
    .replace(/\.dat$/i, '').replace(/[^\-._a-z0-9]+$/i, '')
    .split(/[^\-._a-z0-9]/i).pop() || 'dat-' + Date.now()
}

function failure (err, args, msg) {
  rimraf(args.path, function () {
    abort(err, args, msg)
  })
}

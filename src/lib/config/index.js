'use strict'

require('dotenv').config()
const defaults = require('defaults')
const path = require('path')
const fs = require('fs')
const utils = require('../utils')

class Config {
  constructor () {
    this.filesPatters = ['**/*.config.*', '**/config.*']
    this.extensions = ['json', 'js']
    this.config = {
      paths: {}
    }
    this.i = false
  }

  get (query = false, object) {
    if (!this.i) this.init()
    if (!query) return this.config

    object = object || this.config
    const elems = Array.isArray(query) ? query : query.split('.')
    const name = elems[0]
    const value = object[name]

    if (elems.length <= 1) return value

    if (value === null || typeof value !== 'object') return undefined

    return this.get(elems.slice(1), value)
  }

  add (...patters) {
    patters = Array.isArray(patters) ? patters : [patters]

    const configFromFiles = utils.loadFiles(patters, {
      extensions: this.extensions
    })

    this.config = { ...this.config, ...configFromFiles.data }
    this.config.paths.config = configFromFiles.paths
    this.config.paths = utils.resolvePaths(this.config.paths)

    return this.config
  }

  init2 (options) {
    options = defaults(options, {
      dir: process.env.CONFIG_DIR || process.cwd(),
      file: process.env.CONFIG_FILE || null,
      exclude: []
    })

    let { dir, file, exclude } = options

    dir = (dir[0] !== '.') ? dir : path.join(process.cwd(), dir)

    if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
      throw new Error(`The config directory ${dir} not is directory or no exist`)
    }

    let configObject = utils.loadFileConfigs(dir, file)

    configObject = utils.parsePaths(configObject)

    configObject.paths = {
      ...configObject.paths,
      main: process.cwd(),
      dir,
      files: utils.getFileConfigs(dir)
    }

    if (exclude.indexOf('env') < 0) {
      configObject.env = process.env
    }

    if (!configObject || Object.keys(configObject).length < 1) {
      console.error('The config data not found')
    }

    this.config = configObject
    this.fileName = file
    this.dir = dir
  }

  init (options) {
    options = defaults(options, {
      // dir: process.cwd(),
      defaultFiles: true,
      files: [],
      env: true
    })

    this.i = true

    const { env, defaultFiles } = options
    let { files } = options

    files = Array.isArray(files) ? files : [files]
    files = defaultFiles ? this.filesPatters.concat(files) : files

    this.add(...files)

    if (env) {
      this.config.env = process.env
    }
  }
}

module.exports = new Config()

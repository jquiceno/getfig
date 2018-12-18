'use strict'

import defaults from 'defaults'
import path from 'path'
import fs from 'fs'
import utils from '../utils'

class Config {
  constructor (options = {}) {
    options = defaults(options, {
      dir: process.env['CONFIG_DIR'] || process.cwd(),
      file: process.env['CONFIG_FILE'] || null
    })

    let { dir, file } = options

    if (dir.indexOf('.') === 0) {
      dir = path.join(process.cwd(), dir)
    }

    if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
      throw new Error(`The config directory ${dir} not is directory or no exist`)
    }

    let configObject = utils.loadFileConfigs(dir, file)

    if (!configObject || Object.keys(configObject).length < 1) {
      console.error(`The config data not found`)
    }

    configObject = utils.parsePaths(configObject)

    configObject.paths.main = process.cwd()
    configObject.paths.dir = dir
    configObject.paths.files = utils.getFileConfigs(dir)

    this.config = configObject
    this.fileName = file
    this.dir = dir
  }

  get (query = false, object) {
    if (!query) {
      return this.config
    }

    object = object || this.config
    const elems = Array.isArray(query) ? query : query.split('.')
    const name = elems[0]
    const value = object[name]

    if (elems.length <= 1) {
      return value
    }

    if (value === null || typeof value !== 'object') {
      return undefined
    }

    return this.get(elems.slice(1), value)
  }
}

module.exports = Config

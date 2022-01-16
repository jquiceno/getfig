'use strict'

require('dotenv').config()
const utils = require('../utils')
const Str = require('@supercharge/strings')

const { CONFIG_ENV, CONFIG_FILES_DEFAULT } = process.env

class Config {
  constructor () {
    this.filesPatters = ['**/*.config.*', '**/config.*', '**/config/index.js']
    this.extensions = ['json', 'js']
    this.config = {
      paths: {}
    }

    if (CONFIG_FILES_DEFAULT !== 'false') {
      this.add({
        patters: this.filesPatters
      })
    }

    if (CONFIG_ENV !== 'false') {
      this.config.env = process.env
    }
  }

  get (query = false, object) {
    if (!query) return this.config

    object = object || this.config
    const elems = Array.isArray(query) ? query : query.split('.')
    const name = elems[0]
    const value = object[name]

    if (elems.length <= 1) return value

    if (value === null || typeof value !== 'object') return undefined

    return this.get(elems.slice(1), value)
  }

  add ({ key = false, patters = [] } = {}) {
    patters = Array.isArray(patters) ? patters : [patters]

    const { data, paths } = utils.loadFiles(patters, {
      extensions: this.extensions
    })

    if (key) {
      key = Str(key).camel().get()
      this.config[key] = { ...this.config[key], ...data }
    } else {
      this.config = { ...this.config, ...data }
    }

    this.config.paths.config = paths
    this.config.paths = utils.resolvePaths(this.config.paths)

    return this.config
  }

  init () {
    const envConfigs = utils.getConfigsFromObject(process.env)

    Object.keys(envConfigs).forEach(key => {
      this.add({ key, patters: envConfigs[key] })
    })
  }
}

const config = new Config()
config.init()

module.exports = config

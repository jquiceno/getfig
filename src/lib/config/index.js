'use strict'

import defaults from 'defaults'
import path from 'path'
import fs from 'fs'

const baseNames = ['config', 'default']
const extNames = ['json']

const utils = {
  parseString (content, format) {
    let configObject = null
    if (format === 'json') {
      try {
        configObject = JSON.parse(content)
      } catch (e) {
        throw new Error('Error Json parse')
      }
    }

    return configObject
  },

  parseFile (fullFilename) {
    let extension = fullFilename.substr(fullFilename.lastIndexOf('.') + 1)
    let configObject = null
    let fileContent = null
    let stat = null

    try {
      stat = fs.statSync(fullFilename)
      if (!stat || stat.size < 1) {
        return null
      }
    } catch (e1) {
      return null
    }

    try {
      fileContent = fs.readFileSync(fullFilename, 'UTF-8')
      fileContent = fileContent.replace(/^\uFEFF/, '')
    } catch (e2) {
      throw new Error(`Config file ${fullFilename} cannot be read`)
    }

    configObject = this.parseString(fileContent, extension)

    return configObject
  },

  loadFileConfigs (configDir) {
    let config = {}

    baseNames.forEach(baseName => {
      extNames.forEach(extName => {
        // Try merging the config object into this object
        let fullFilename = path.join(configDir, `${baseName}.${extName}`)
        let configObj = utils.parseFile(fullFilename)
        if (configObj) {
          Object.assign(config, configObj)
        }
      })
    })

    return config
  }
}

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

    const configObject = utils.loadFileConfigs(dir)

    if (!configObject || Object.keys(configObject).length < 1) {
      console.error(`The config data not found`)
    }

    this.config = configObject
    this.fileName = file
    this.dir = dir
  }

  get (query) {
    return this.config
  }
}

module.exports = Config

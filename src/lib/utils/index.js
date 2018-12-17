'use struct'

import path from 'path'
import fs from 'fs'

const baseNames = ['config', 'default']
const extNames = ['json']

module.exports = {
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
    const self = this
    let config = {}

    baseNames.forEach(baseName => {
      extNames.forEach(extName => {
        // Try merging the config object into this object
        let fullFilename = path.join(configDir, `${baseName}.${extName}`)
        let configObj = self.parseFile(fullFilename)
        if (configObj) {
          Object.assign(config, configObj)
        }
      })
    })

    return config
  },

  parsePaths (configObj) {
    if (!configObj.paths) {
      configObj.paths = {}
      return configObj
    }

    Object.keys(configObj.paths).map((p, i) => {
      const newPath = path.join(process.cwd(), configObj.paths[p])
      configObj.paths[p] = newPath
    })
    return configObj
  },

  getFileConfigs (configDir) {
    // const self = this
    let files = []

    baseNames.forEach(baseName => {
      extNames.forEach(extName => {
        let fullFilename = path.join(configDir, `${baseName}.${extName}`)
        files.push(fullFilename)
      })
    })

    return files
  }
}

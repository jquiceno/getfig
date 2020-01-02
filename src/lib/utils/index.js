'use struct'

const path = require('path')
const fs = require('fs')

let baseNames = ['config', 'default']
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
    const extension = fullFilename.substr(fullFilename.lastIndexOf('.') + 1)
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

  loadFileConfigs (configDir, files = null) {
    const self = this
    const config = {}

    if (files) {
      files = (typeof file === 'object') ? files : [files]

      baseNames = baseNames.concat(files)
    }

    baseNames.forEach(baseName => {
      extNames.forEach(extName => {
        // Try merging the config object into this object
        const fullFilename = path.join(configDir, `${baseName}.${extName}`)
        const configObj = self.parseFile(fullFilename)
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
    const files = []

    baseNames.forEach(baseName => {
      extNames.forEach(extName => {
        const fullFilename = path.join(configDir, `${baseName}.${extName}`)
        try {
          const stat = fs.statSync(fullFilename)
          if (!stat || stat.size < 1) {
            return null
          }

          files.push(fullFilename)
        } catch (e1) {
          return null
        }
      })
    })

    return files
  }
}

'use struct'

const path = require('path')
const fs = require('fs')

let baseNames = ['config', 'default']
const extNames = ['json']

function parseFile (fullFilename) {
  const extension = fullFilename.substr(fullFilename.lastIndexOf('.') + 1)

  try {
    const stat = fs.statSync(fullFilename)
    if (!stat || stat.size < 1) {
      return null
    }
  } catch (error) {
    return null
  }

  try {
    const fileContent = fs.readFileSync(fullFilename, 'UTF-8').replace(/^\uFEFF/, '')
    const configObject = parseString(fileContent, extension)

    return configObject
  } catch (error) {
    throw new Error(`Config file ${fullFilename} cannot be read`)
  }
}

function parseString (content, format) {
  let configObject = null
  if (format === 'json') {
    try {
      configObject = JSON.parse(content)
    } catch (e) {
      throw new Error('Error Json parse')
    }
  }

  return configObject
}

function loadFileConfigs (configDir, files = null) {
  const config = {}

  if (files) {
    files = (typeof file === 'object') ? files : [files]

    baseNames = baseNames.concat(files)
  }

  baseNames.forEach(baseName => {
    extNames.forEach(extName => {
      // Try merging the config object into this object
      const fullFilename = path.join(configDir, `${baseName}.${extName}`)
      const configObj = parseFile(fullFilename)
      if (configObj) {
        Object.assign(config, configObj)
      }
    })
  })

  return config
}

function parsePaths (configObj) {
  if (!configObj.paths) {
    configObj.paths = {}
    return configObj
  }

  Object.keys(configObj.paths).map((p, i) => {
    const newPath = path.join(process.cwd(), configObj.paths[p])
    configObj.paths[p] = newPath
  })
  return configObj
}

function getFileConfigs (configDir) {
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

module.exports = {
  parseFile,
  parseString,
  loadFileConfigs,
  parsePaths,
  getFileConfigs
}

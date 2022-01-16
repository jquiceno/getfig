'use struct'

const path = require('path')
const fs = require('fs')
const glob = require('glob')

let baseNames = ['config', 'default']
const extNames = ['json', 'js']

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

function resolvePaths (paths) {
  Object.keys(paths).forEach(p => {
    if (typeof paths[p] === 'object') {
      return resolvePaths(paths[p])
    }

    const newPath = path.join(process.cwd(), paths[p])
    paths[p] = newPath
  })

  return paths
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

function getFileExtension (fileName) {
  const extension = fileName.substr(fileName.lastIndexOf('.') + 1)
  // console.log(path.extname(fileName).split('.')[1])

  return extension
}

function findFiles (patter, { extensions } = {}) {
  const files = glob.sync(patter, {
    ignore: '**/node_modules/**'
  })

  if (extensions) return files.filter(filePath => extensions.includes(getFileExtension(filePath)))

  return files
}

function loadFilesFromDir (dirPath, { extensions } = {}) {
  const patter = `${dirPath}/*`
  const files = findFiles(patter)

  return files
}

function loadFiles (patters, { extensions } = {}) {
  const cwd = process.cwd()
  patters = Array.isArray(patters) ? patters : [patters]

  let filesPaths = []
  let data = {}

  patters.forEach(patter => {
    const files = findFiles(patter, { extensions })

    filesPaths = filesPaths.concat(files)
  })

  filesPaths.forEach(file => {
    const dataFromFile = require(`${cwd}/${file}`)
    if (!dataFromFile || typeof dataFromFile !== 'object') return
    data = mergeObjects([data, dataFromFile])
  })

  return {
    paths: filesPaths,
    data
  }
}

function mergeObjects (objectsList) {
  let finalObjt = {}

  for (const key in objectsList) {
    const obj = objectsList[key]

    if (key === 0) {
      finalObjt = obj
      console.log(finalObjt)
      return
    }

    Object.keys(obj).forEach(key => {
      // if (typeof finalObjt[key] === 'object') {
      //   finalObjt[key] = mergeObjects([finalObjt[key], obj[key]])
      // }

      if (!finalObjt[key]) {
        finalObjt[key] = obj[key]
        return
      }

      finalObjt[key] = !Array.isArray(finalObjt[key]) ? [finalObjt[key]] : finalObjt[key]

      return finalObjt[key].push(obj[key])
    })
  }

  return finalObjt
}

function getConfigsFromObject (configsObject = {}) {
  const config = {}
  for (const key in configsObject) {
    if (!key.startsWith('CONFIG_')) continue

    const configKey = key.split('CONFIG_')[1]

    if (!configKey || ['ENV'].includes(configKey)) continue

    config[configKey] = configsObject[key]
  }

  return config
}

module.exports = {
  parseFile,
  parseString,
  loadFileConfigs,
  resolvePaths,
  getFileConfigs,
  loadFilesFromDir,
  loadFiles,
  getConfigsFromObject
}

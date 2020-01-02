'use strict'

const test = require('ava')
const { Config } = require('../src/')
const fs = require('fs')
const path = require('path')

const customConfigData = {
  production: {
    key: 'saljhdlajidpsd'
  },
  paths: {
    uploads: 'uploads'
  }
}

const customConfigDirPath = path.join(__dirname, 'configDir')
const customConfigFilePath = `${customConfigDirPath}/default.json`

if (!fs.existsSync(customConfigDirPath) || !fs.lstatSync(customConfigDirPath).isDirectory()) {
  fs.mkdirSync(customConfigDirPath)
}

if (!fs.existsSync(customConfigFilePath)) {
  fs.writeFileSync(customConfigFilePath, JSON.stringify(customConfigData))
}

// test.beforeEach(async t => {
// })

// test.afterEach(async t => {
// })

test('Default config dir path', async t => {
  const config = new Config()
  t.deepEqual(config.dir, process.cwd(), 'Default dir not is Equal')
})

test('Custom config Dir', async t => {
  const configObj = new Config({
    dir: customConfigDirPath
  })

  t.deepEqual(configObj.dir, customConfigDirPath, 'Default dir not is Equal')
})

test('Custom config Dir by env CONFIG_DIR', async t => {
  process.env.CONFIG_DIR = customConfigDirPath

  const getfig = new Config()

  t.deepEqual(getfig.dir, customConfigDirPath, 'Default dir not is Equal')
})

test('Custom config Dir defined by ., ..', async t => {
  const configDirPath = process.cwd()
  process.env.CONFIG_DIR = '.'

  if (!fs.existsSync(configDirPath) || !fs.lstatSync(configDirPath).isDirectory()) {
    fs.mkdirSync(configDirPath)
  }

  const getfig = new Config()

  t.deepEqual(getfig.dir, configDirPath, 'Default dir not is Equal')
})

test('Config parse paths', async t => {
  const configDirPath = process.cwd()

  const config = new Config()
  const configData = config.get()

  t.deepEqual(configDirPath, configData.paths.main, 'Default dir not is Equal')
})

test('Get config data', async t => {
  const config = new Config()
  const configData = config.get()

  t.is(typeof configData, 'object', 'Config data not is object')
  t.is(typeof configData.production, 'object', 'Config data not is object')
  t.deepEqual(configData.production.key, customConfigData.production.key, 'Config data not is correct')
})

test('Get config data with query string', async t => {
  const config = new Config()
  const productionConfig = config.get('production')
  const configKey = config.get('production.key')
  const indefinedQuery = config.get('production.test')

  t.is(typeof productionConfig, 'object', 'Production config data not is object')
  t.is(typeof indefinedQuery, 'undefined', 'Undefined query data not is object')
  t.deepEqual(configKey, customConfigData.production.key, 'Config key not is correct')
})

test('Get config by custom file', async t => {
  const customFile = 'configrc'
  customConfigData.custom = {
    customFileName: customFile
  }

  fs.writeFileSync(path.join(process.cwd(), `${customFile}.json`), JSON.stringify(customConfigData))

  const config = new Config({
    file: 'configrc'
  })

  const configData = config.get('custom')

  fs.unlinkSync(path.join(process.cwd(), `${customFile}.json`))
  t.deepEqual(configData.customFileName, customFile, 'Custom data not is equal')
})

test.after(async t => {
  fs.unlinkSync(customConfigFilePath)
  fs.rmdirSync(customConfigDirPath)
})

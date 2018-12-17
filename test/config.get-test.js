'use strict'

import test from 'ava'
import { Config } from '../src/'
import fs from 'fs'
import path from 'path'

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

// import path from 'path'

// test.beforeEach(async t => {
// })

// test.afterEach(async t => {
// })

// test('Default config dir', async t => {
//   t.deepEqual(config.dir, process.cwd(), 'Default dir not is Equal')
//   // let e = t.throws(() => {
//   //   throw new PmxError('Source not found', {
//   //     status_code: 404,
//   //     data: {
//   //       test: 'ok'
//   //     }
//   //   })
//   // })
//   //
//   // t.is(e.output.payload instanceof Object, true, 'Error Payload not is Object')
//   // t.is(e.data instanceof Object, true, 'Error data not is Object')
//   // t.deepEqual(e.output.payload.status_code, 404, 'Payload status code nos is 404')
//   // t.deepEqual(e.data.test, 'ok', 'Custom data is invalid')
//   // t.regex(e.message, /Source not found/, 'Error message is invalid')
//   // t.regex(e.output.payload.message, /Source not found/, 'Error message is invalid')
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
  process.env['CONFIG_DIR'] = customConfigDirPath

  const getfig = new Config()

  t.deepEqual(getfig.dir, customConfigDirPath, 'Default dir not is Equal')
})

test('Custom config Dir defined by ., ..', async t => {
  const configDirPath = process.cwd()
  process.env['CONFIG_DIR'] = '.'

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

test.after(async t => {
  fs.unlinkSync(customConfigFilePath)
  fs.rmdirSync(customConfigDirPath)
})

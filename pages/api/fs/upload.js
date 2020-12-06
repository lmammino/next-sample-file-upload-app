import { join, basename, extname } from 'path'
import { rename, access } from 'fs/promises'
import { constants } from 'fs'
import getConfig from 'next/config'
import formidable from 'formidable'
import uploadConfig from '../../_uploadConfig'

const { serverRuntimeConfig } = getConfig()

async function fileExists (filePath) {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch (_) {
    return false
  }
}

function handleUpload (form, req) {
  return new Promise((resolve, reject) => {
    let file = null

    form.onPart = function (part) {
      if (part.mime && !uploadConfig.supportedMimeTypes.includes(part.mime)) {
        return reject(new Error('Invalid file type'))
      }

      form.handlePart(part)
    }

    form.parse(req)
    form.on('file', (_, f) => {
      file = f
    })

    form.on('error', reject)
    form.on('aborted', () => reject(new Error('aborted')))
    form.on('end', () => resolve(file))
  })
}

export default async function handler (req, res) {
  const form = formidable({
    keepExtensions: true,
    maxFileSize: uploadConfig.maxFileSize,
    maxFieldsSize: uploadConfig.maxFileSize,
    multiples: false
  })

  try {
    const file = await handleUpload(form, req)

    if (file === null) {
      res.statusCode = 400
      return res.json({ error: 'Missing file in request' })
    }

    // avoids potential directory traversal attacks
    let finalFilePath = join(serverRuntimeConfig.DATA_PATH, file.name.replace(/[/\\]+/g, '_'))
    let finalFileName = basename(finalFilePath)

    // avoids potential file overrides
    if (await fileExists(finalFilePath)) {
      const extension = extname(finalFileName)
      const timestamp = Date.now()
      finalFileName = `${finalFileName.substr(0, finalFileName.length - extension.length)}_copy_${timestamp}${extension}`
      finalFilePath = join(serverRuntimeConfig.DATA_PATH, finalFileName)
    }

    await rename(file.path, finalFilePath)

    res.statusCode = 201
    return res.json({ name: finalFileName, size: file.size })
  } catch (err) {
    res.statusCode = 400
    return res.json({ error: err.message })
  }
}

export const config = {
  api: {
    bodyParser: false
  }
}

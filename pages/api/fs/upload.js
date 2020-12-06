import { join } from 'path'
import { rename } from 'fs/promises'
import getConfig from 'next/config'
import formidable from 'formidable'
import uploadConfig from '../../_uploadConfig'

const { serverRuntimeConfig } = getConfig()

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

    await rename(file.path, join(serverRuntimeConfig.DATA_PATH, file.name))

    res.statusCode = 201
    return res.json({ name: file.name, size: file.size })
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

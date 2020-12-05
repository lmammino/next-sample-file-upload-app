import { join } from 'path'
import { rename } from 'fs/promises'
import getConfig from 'next/config'
import formidable from 'formidable'

const { serverRuntimeConfig } = getConfig()

function handleUpload (form, req) {
  return new Promise((resolve, reject) => {
    let file = null

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
    maxFileSize: 10 * 1024 * 1024,
    maxFieldsSize: 10 * 1024 * 1024,
    multiples: false
  })

  const file = await handleUpload(form, req)
  if (file === null) {
    res.statusCode = 400
    return res.json({ error: 'Missing file in request' })
  }

  await rename(file.path, join(serverRuntimeConfig.DATA_PATH, file.name))

  res.statusCode = 200
  return res.json({ name: file.name, size: file.size })
}

export const config = {
  api: {
    bodyParser: false
  }
}

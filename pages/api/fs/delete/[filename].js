import { join } from 'path'
import { unlink } from 'fs/promises'
import getConfig from 'next/config'

const { serverRuntimeConfig } = getConfig()

export default async function handler (req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE'])
    res.statusCode = 405
    return res.json({ error: 'Method not supported' })
  }

  const { filename } = req.query

  if (!filename) {
    res.statusCode = 400
    return res.json({ error: 'Missing filename in request' })
  }

  const filePath = join(serverRuntimeConfig.DATA_PATH, filename)

  try {
    await unlink(filePath)
    res.statusCode = 200
    return res.json({ success: true, deleted: filename })
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.statusCode = 200
      return res.json({ success: true, deleted: filename })
    }
    console.error(err)
    res.statusCode = 500
    return res.json({ error: `Failed to delete: ${filename}` })
  }
}

import { join } from 'path'
import { readdir, stat } from 'fs/promises'
import getConfig from 'next/config'

const { serverRuntimeConfig } = getConfig()

export default async function handler (req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    return res.json({ error: 'Method not supported' })
  }

  const allFiles = await readdir(serverRuntimeConfig.DATA_PATH, { encoding: 'utf8', withFileTypes: true })
  const selectedFiles = allFiles.filter((f) =>
    f.isFile() &&
    (f.name.endsWith('.png') || f.name.endsWith('.jpg'))
  )
  const filesWithSize = await Promise.all(selectedFiles.map(async (f) => {
    const fileStats = await stat(join(serverRuntimeConfig.DATA_PATH, f.name))
    return { name: f.name, size: fileStats.size }
  }))

  const totalSize = filesWithSize.reduce((acc, curr) => acc + curr.size, 0)

  res.statusCode = 200
  res.json({ files: filesWithSize, totalSize })
}

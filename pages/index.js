import { useReducer, useEffect, useRef } from 'react'
import Head from 'next/head'
import prettyBytes from 'pretty-bytes'
import styles from '../styles/Home.module.css'
import FileCard from '../components/fileCard'

const initialState = {
  initialLoading: true,
  uploading: false,
  allFiles: [],
  filteredFiles: [],
  deletingFiles: new Set(),
  filteredTotalFileSize: 0,
  searchKeyword: ''
}

function filterFiles (files, keyword) {
  const filteredFiles = []
  let filteredTotalFileSize = 0
  for (const file of files) {
    if (file.name.includes(keyword)) {
      filteredFiles.push(file)
      filteredTotalFileSize += file.size
    }
  }

  return [filteredFiles, filteredTotalFileSize]
}

function reducer (state, action) {
  switch (action.type) {
    case 'dataLoaded': {
      const [filteredFiles, filteredTotalFileSize] = filterFiles(action.data.files, state.searchKeyword)
      return { ...state, initialLoading: false, allFiles: action.data.files, filteredFiles, filteredTotalFileSize }
    }
    case 'changedSearchKeyword': {
      const searchKeyword = action.event.target.value
      const [filteredFiles, filteredTotalFileSize] = filterFiles(state.allFiles, searchKeyword)
      return { ...state, initialLoading: false, filteredFiles, filteredTotalFileSize, searchKeyword }
    }
    case 'deleteStart': {
      const deletingFiles = new Set(state.deletingFiles)
      deletingFiles.add(action.filename)
      return { ...state, deletingFiles }
    }
    case 'deleteError': {
      const deletingFiles = new Set(state.deletingFiles)
      deletingFiles.delete(action.filename)
      return { ...state, deletingFiles }
    }
    case 'deleteEnd': {
      const deletingFiles = new Set(state.deletingFiles)
      deletingFiles.delete(action.filename)
      const allFiles = state.allFiles.filter((f) => f.name !== action.filename)
      const [filteredFiles, filteredTotalFileSize] = filterFiles(allFiles, state.searchKeyword)
      return { ...state, deletingFiles, allFiles, filteredFiles, filteredTotalFileSize }
    }
    case 'uploadStart': {
      return { ...state, uploading: true }
    }
    case 'uploadEnd': {
      const allFiles = [...state.allFiles, action.newFile]
      const [filteredFiles, filteredTotalFileSize] = filterFiles(allFiles, state.searchKeyword)
      return { ...state, uploading: false, allFiles, filteredFiles, filteredTotalFileSize }
    }
  }

  return state
}

async function triggerFileDelete (filename, dispatch) {
  if (confirm(`Do you want to delete ${filename}`)) {
    dispatch({ type: 'deleteStart', filename })
    try {
      const response = await fetch(`/api/fs/delete/${filename}`, { method: 'DELETE' })
      if (response.status !== 200) {
        throw new Error('Failed to delete')
      }
      dispatch({ type: 'deleteEnd', filename })
    } catch (_) {
      dispatch({ type: 'deleteError', filename })
    }
  }
}

async function triggerUpload (fileInput, dispatch) {
  if (fileInput.files.length >= 1) {
    // TODO: add frontend and backend validation
    const formData = new FormData()
    formData.append('file', fileInput.files[0])
    dispatch({ type: 'uploadStart' })
    const response = await fetch('/api/fs/upload', {
      method: 'POST',
      body: formData
    })
    const newFile = await response.json()
    // TODO: handle upload errors
    dispatch({ type: 'uploadEnd', newFile })
  }
}

export default function Home () {
  const fileInput = useRef(null)
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(function () {
    (async function getData () {
      const resp = await fetch('/api/fs/ls')
      const data = await resp.json()
      dispatch({ type: 'dataLoaded', data })
    })()
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>File manager</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <nav className={styles.nav}>
          <button
            className={styles.upload_btn}
            disabled={state.uploading}
            onClick={(e) => {
              e.preventDefault()
              fileInput.current.click()
            }}
          >{state.uploading ? 'Uploading...' : 'UPLOAD'}</button>
          <input
            className={styles.search_input}
            type="text"
            placeholder="Search documents..."
            value={state.searchKeyword}
            onChange={(e) => { dispatch({ type: 'changedSearchKeyword', event: e }) }}
          />
        </nav>
        { !state.initialLoading &&
          (<>
            <header className={styles.header}>
              <h2>{state.filteredFiles.length} documents</h2>
              <span>Total size: { prettyBytes(state.filteredTotalFileSize) }</span>
            </header>
            <ul className={styles.files_container}>
              { state.filteredFiles.map(f => {
                return <FileCard
                  key={ f.name }
                  name={ f.name }
                  size={ prettyBytes(f.size) }
                  deleting={state.deletingFiles.has(f.name)}
                  onDelete={() => triggerFileDelete(f.name, dispatch)}
                />
              }) }
            </ul>
          </>)}
      </main>

      <input
        ref={fileInput}
        type="file"
        name="file"
        style={{ display: 'none' }}
        onChange={(e) => {
          triggerUpload(e.currentTarget, dispatch)
        }}
        />

    </div>
  )
}

import * as React from 'react'
import { render, screen, fireEvent, waitForElementToBeRemoved } from '@testing-library/react'
import Home from '../pages/index'

beforeEach(() => {
  jest.clearAllMocks()
})

it('Renders without crashing', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({ files: [] })
  })

  render(<Home />)
  const upload = await screen.findAllByText('UPLOAD')
  const search = await screen.findAllByPlaceholderText('Search documents...')
  expect(upload).toHaveLength(1)
  expect(search).toHaveLength(1)
})

it('Shows 0 files when there are no files', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({ files: [] })
  })

  render(<Home />)
  const documentsCount = await screen.findAllByText('0 documents')
  const totalSize = await screen.findAllByText('Total size: 0 B')
  expect(documentsCount).toHaveLength(1)
  expect(totalSize).toHaveLength(1)
})

it('Shows counts and total bytes correctly when there are some files', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      files: [
        { name: 'file1.jpg', size: 123 },
        { name: 'file2.jpg', size: 456 },
        { name: 'file3.jpg', size: 789 }
      ]
    })
  })

  render(<Home />)

  const documentsCount = await screen.findAllByText('3 documents')
  const totalSize = await screen.findAllByText('Total size: 1.37 kB')
  expect(documentsCount).toHaveLength(1)
  expect(totalSize).toHaveLength(1)
})

it('Displays all the files available', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      files: [
        { name: 'file1.jpg', size: 123 },
        { name: 'file2.jpg', size: 456 },
        { name: 'file3.jpg', size: 789 },
        { name: 'file33.jpg', size: 3 }
      ]
    })
  })

  render(<Home />)

  const files = await screen.findAllByText('file', { exact: false })
  expect(files).toHaveLength(4)
})

it('Can filter the files using the search bar', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      files: [
        { name: 'file1.jpg', size: 123 },
        { name: 'file2.jpg', size: 456 },
        { name: 'file3.jpg', size: 789 },
        { name: 'file33.jpg', size: 3 }
      ]
    })
  })

  render(<Home />)

  fireEvent.change(screen.getByPlaceholderText('Search documents...'), { target: { value: 'file3' } })

  const files = await screen.findAllByText('file', { exact: false })
  const totalSize = await screen.findAllByText('Total size: 792 B')
  expect(files).toHaveLength(2)
  expect(totalSize).toHaveLength(1)
})

it('Deletes files', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      files: [
        { name: 'file1.jpg', size: 123 },
        { name: 'file2.jpg', size: 456 },
        { name: 'file3.jpg', size: 789 },
        { name: 'file33.jpg', size: 3 }
      ]
    })
  })

  render(<Home />)

  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      deleted: 'file33.jpg'
    })
  })

  global.confirm = jest.fn().mockReturnValueOnce(true)

  const files = await screen.findAllByText('file', { exact: false })
  expect(files).toHaveLength(4)

  const deleteButtons = await screen.findAllByText('delete', { exact: false })

  fireEvent.click(deleteButtons[3])
  expect(global.confirm).toHaveBeenCalledWith('Do you want to delete file33.jpg')
  expect(global.fetch).toHaveBeenLastCalledWith('/api/fs/delete/file33.jpg', { method: 'DELETE' })

  await waitForElementToBeRemoved(files[3])

  const filesAfterDelete = await screen.findAllByText('file', { exact: false })
  expect(filesAfterDelete).toHaveLength(3)
})

it('Uploads new files', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      files: []
    })
  })

  render(<Home />)

  const uploadField = await screen.findByTestId('upload-field')
  const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })

  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    status: 201,
    json: async () => ({
      name: 'chucknorris.png',
      size: 6
    })
  })

  fireEvent.change(uploadField, { target: { files: [file] } })

  expect(global.fetch).toHaveBeenLastCalledWith('/api/fs/upload', { method: 'POST', body: expect.any(FormData) })
  const newFile = await screen.findAllByText('chucknorris.png', { exact: false })
  expect(newFile).toHaveLength(1)
})

import api from './api'

const uploadImage = async (file, folder = 'menu') => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('folder', folder)

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return data.url || data.path || null
}

export const uploadService = { uploadImage }
export default uploadService

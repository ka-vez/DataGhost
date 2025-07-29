import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, File, Trash2, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
}

interface UploadedFile {
  file: File
  name: string
  size: string
  type: string
}

export function FileUploadModal({ isOpen, onClose, onSave }: FileUploadModalProps) {
  const { userProfile } = useAuth()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [action, setAction] = useState<'Delete' | 'Transfer' | 'Archive'>('Archive')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [timeDelay, setTimeDelay] = useState('00:00:00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    const newFiles = selectedFiles.map(file => ({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'Unknown'
    }))
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const droppedFiles = Array.from(event.dataTransfer.files)
    const newFiles = droppedFiles.map(file => ({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'Unknown'
    }))
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (files.length === 0) {
      setError('Please select at least one file')
      setLoading(false)
      return
    }

    if (action === 'Transfer' && !recipientEmail) {
      setError('Recipient email is required for transfer actions')
      setLoading(false)
      return
    }

    try {
      // Upload files to Supabase storage
      for (const uploadedFile of files) {
        if (!userProfile?.username) {
          throw new Error('User profile not found')
        }

        // Create file path: username/filename
        const filePath = `${userProfile.username}/${uploadedFile.name}`
        
        // Upload file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('digital-assets')
          .upload(filePath, uploadedFile.file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Failed to upload ${uploadedFile.name}: ${uploadError.message}`)
        }

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('digital-assets')
          .getPublicUrl(filePath)

        const assetData = {
          platform_name: `File: ${uploadedFile.name}`,
          action,
          recipient_email: action === 'Transfer' ? recipientEmail : null,
          time_delay: timeDelay,
          file_data: publicUrl,
          file_name: uploadedFile.name,
          file_size: uploadedFile.size,
          file_type: uploadedFile.type,
          storage_path: filePath
        }

        await onSave(assetData)
      }

      // Reset form
      setFiles([])
      setAction('Archive')
      setRecipientEmail('')
      setTimeDelay('00:00:00')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to upload files. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const timeDelayOptions = [
    { value: '00:00:00', label: 'Immediately' },
    { value: '01:00:00', label: '1 hour' },
    { value: '24:00:00', label: '1 day' },
    { value: '168:00:00', label: '1 week' },
    { value: '720:00:00', label: '1 month' },
    { value: '4320:00:00', label: '6 months' },
    { value: '8760:00:00', label: '1 year' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Upload Digital Assets
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Files
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop files here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports all file types
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Files ({files.length})
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {files.map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <File className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {file.size} • {file.type}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Archive">Archive</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Delete">Delete</option>
                  </select>
                </div>

                {/* Recipient Email */}
                {action === 'Transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="recipient@example.com"
                      required
                    />
                  </div>
                )}

                {/* Time Delay */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Execution Delay
                  </label>
                  <select
                    value={timeDelay}
                    onChange={(e) => setTimeDelay(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {timeDelayOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading || files.length === 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Uploading...' : 'Save Files'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
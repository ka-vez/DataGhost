import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Plus, 
  Upload, 
  Download, 
  Settings, 
  File, 
  Archive, 
  Trash, 
  Share,
  Search,
  Filter,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  List
} from 'lucide-react'
import { useDigitalAssets } from '../hooks/useDigitalAssets'
import { AssetModal } from './AssetModal'
import { FileUploadModal } from './FileUploadModal'
import { UserProfileModal } from './UserProfileModal'
import { AssetCard } from './AssetCard'
import { AlertToast } from './AlertToast'
import { generateDigitalWillPDF } from '../utils/pdfGenerator'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ isOpen = false, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { userProfile } = useAuth()
  const { assets, loading, addAsset, updateAsset, deleteAsset } = useDigitalAssets()
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [editingAsset, setEditingAsset] = useState<string | null>(null)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [alert, setAlert] = useState<{
    isVisible: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    description?: string
    actionType?: 'Delete' | 'Transfer' | 'Archive'
  }>({
    isVisible: false,
    type: 'success',
    title: ''
  })
  const navigate = useNavigate()

  const handleDownloadWill = async () => {
    setDownloadingPDF(true)
    try {
      await generateDigitalWillPDF(assets, userProfile?.username || 'User')
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setDownloadingPDF(false)
    }
  }

  const assetCounts = {
    all: assets.length,
    Delete: assets.filter(a => a.action === 'Delete').length,
    Transfer: assets.filter(a => a.action === 'Transfer').length,
    Archive: assets.filter(a => a.action === 'Archive').length
  }

  const handleAssetSave = async (data: any) => {
    try {
      if (editingAsset) {
        await updateAsset(editingAsset, data)
        showAlert('success', 'Asset Updated', `${data.platform_name} asset has been updated successfully.`, data.action)
      } else {
        await addAsset(data)
        showAlert('success', 'Asset Added', `${data.platform_name} asset has been added successfully.`, data.action)
      }
      setShowAssetModal(false)
      setEditingAsset(null)
    } catch (error) {
      console.error('Failed to save asset:', error)
      showAlert('error', 'Error', 'Failed to save asset. Please try again.')
    }
  }

  const handleFileUploadSave = async (data: any) => {
    try {
      await addAsset(data)
      showAlert('success', 'File Uploaded', `${data.platform_name} file has been uploaded successfully.`, data.action)
      setShowFileUpload(false)
    } catch (error) {
      console.error('Failed to upload file:', error)
      showAlert('error', 'Upload Failed', 'Failed to upload file. Please try again.')
    }
  }

  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    description?: string,
    actionType?: 'Delete' | 'Transfer' | 'Archive'
  ) => {
    setAlert({
      isVisible: true,
      type,
      title,
      description,
      actionType
    })
  }

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isVisible: false }))
  }

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Mobile Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative w-80 bg-white shadow-xl overflow-y-auto"
          >
            {/* Mobile Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900">Digital Assets</h2>
                  <p className="text-sm text-gray-500">{assets.length} total assets</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close sidebar"
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile Sidebar Content */}
            <div className="p-6">
              {/* Action Buttons */}
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowAssetModal(true)
                    onClose?.()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Asset
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowFileUpload(true)
                    onClose?.()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload Files
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate('/asset-details')
                    onClose?.()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  <List className="w-4 h-4" />
                  Asset Details
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleDownloadWill()
                    onClose?.()
                  }}
                  disabled={downloadingPDF || assets.length === 0}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {downloadingPDF ? 'Generating...' : 'Download Will'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowUserProfile(true)
                    onClose?.()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Profile Settings
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <motion.div 
        className="hidden lg:block bg-white border-r border-gray-200 min-h-screen overflow-y-auto flex-shrink-0 relative"
        animate={{ width: isCollapsed ? "80px" : "256px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-10"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900">Digital Assets</h2>
                <p className="text-sm text-gray-500">{assets.length} total assets</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAssetModal(true)}
              className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors ${
                isCollapsed ? 'justify-center' : 'w-full'
              }`}
              title={isCollapsed ? "Add Asset" : undefined}
            >
              <Plus className="w-4 h-4" />
              {!isCollapsed && "Add Asset"}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFileUpload(true)}
              className={`flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors ${
                isCollapsed ? 'justify-center' : 'w-full'
              }`}
              title={isCollapsed ? "Upload Files" : undefined}
            >
              <Upload className="w-4 h-4" />
              {!isCollapsed && "Upload Files"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/asset-details')}
              className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors ${
                isCollapsed ? 'justify-center' : 'w-full'
              }`}
              title={isCollapsed ? "Asset Details" : undefined}
            >
              <List className="w-4 h-4" />
              {!isCollapsed && "Asset Details"}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadWill}
              disabled={downloadingPDF || assets.length === 0}
              className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isCollapsed ? 'justify-center' : 'w-full'
              }`}
              title={isCollapsed ? "Download Will" : undefined}
            >
              <Download className="w-4 h-4" />
              {!isCollapsed && (downloadingPDF ? 'Generating...' : 'Download Will')}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserProfile(true)}
              className={`flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors ${
                isCollapsed ? 'justify-center' : 'w-full'
              }`}
              title={isCollapsed ? "Profile Settings" : undefined}
            >
              <Settings className="w-4 h-4" />
              {!isCollapsed && "Profile Settings"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AssetModal
        isOpen={showAssetModal}
        onClose={() => {
          setShowAssetModal(false)
          setEditingAsset(null)
        }}
        onSave={handleAssetSave}
        asset={editingAsset ? assets.find(a => a.id === editingAsset) : undefined}
      />

      <FileUploadModal
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onSave={handleFileUploadSave}
      />

      <UserProfileModal
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />

      {/* Alert Toast */}
      <AlertToast
        isVisible={alert.isVisible}
        type={alert.type}
        title={alert.title}
        description={alert.description}
        actionType={alert.actionType}
        onClose={hideAlert}
      />
    </>
  )
}
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Filter,
  File,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react'
import { useDigitalAssets } from '../hooks/useDigitalAssets'
import { AssetCard } from './AssetCard'
import { AssetModal } from './AssetModal'
import { AlertToast } from './AlertToast'
import { useNavigate } from 'react-router-dom'

export function AssetDetails() {
  const { assets, loading, deleteAsset, updateAsset } = useDigitalAssets()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<string | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [alert, setAlert] = useState<{
    isVisible: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    description?: string
    actionType?: 'Delete' | 'Transfer' | 'Memorialize'
  }>({
    isVisible: false,
    type: 'success',
    title: ''
  })
  const navigate = useNavigate()

  // Check if we're viewing a specific asset (from URL params or state)
  // If the asset list changes and becomes empty, or if viewing a specific asset that no longer exists,
  // automatically redirect to dashboard
  useEffect(() => {
    // If there are no assets at all, redirect to dashboard
    if (!loading && assets.length === 0) {
      navigate('/dashboard')
    }
  }, [assets, loading, navigate])

  // Filter assets based on search and filter
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.platform_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (asset.recipient_email && asset.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterAction === 'all' || asset.action === filterAction
    return matchesSearch && matchesFilter
  })

  const assetCounts = {
    all: assets.length,
    Delete: assets.filter(a => a.action === 'Delete').length,
    Transfer: assets.filter(a => a.action === 'Transfer').length,
    Memorialize: assets.filter(a => a.action === 'Memorialize').length
  }

  const handleEdit = (assetId: string) => {
    setEditingAsset(assetId)
    setShowEditModal(true)
  }

  const handleDeleteClick = (assetId: string) => {
    setDeletingAsset(assetId)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (deletingAsset) {
      const assetToDelete = assets.find(a => a.id === deletingAsset)
      if (!assetToDelete) return

      setIsDeleting(true)
      
      try {
        await deleteAsset(deletingAsset)
        
        // Show success message briefly before navigating
        showAlert('success', 'Asset Deleted', `${assetToDelete.platform_name} asset has been deleted successfully.`, assetToDelete.action)
        
        // Navigate back to dashboard after a short delay to show the success message
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
        
      } catch (error) {
        console.error('Failed to delete asset:', error)
        showAlert('error', 'Delete Failed', 'Failed to delete asset. Please try again.')
        setIsDeleting(false)
      }
      
      setShowDeleteConfirm(false)
      setDeletingAsset(null)
    }
  }

  const handleEditSave = async (idOrData: any, data?: any) => {
    // Handle both cases: editing (id, data) and adding (data only)
    if (data) {
      // Editing case: first param is id, second is data
      try {
        await updateAsset(idOrData, data)
        showAlert('success', 'Asset Updated', `${data.platform_name} asset has been updated successfully.`, data.action)
      } catch (error) {
        console.error('Failed to update asset:', error)
        showAlert('error', 'Update Failed', 'Failed to update asset. Please try again.')
      }
    } else {
      // Adding case: first param is data
      console.log('This should not happen in AssetDetails - adding is handled in Dashboard')
    }
    setShowEditModal(false)
    setEditingAsset(null)
  }

  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    description?: string,
    actionType?: 'Delete' | 'Transfer' | 'Memorialize'
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

  const deletingAssetData = deletingAsset ? assets.find(a => a.id === deletingAsset) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Asset Details</h1>
                <p className="text-sm text-gray-500">Manage your digital assets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                aria-label="Filter assets by action"
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Actions ({assetCounts.all})</option>
                <option value="Delete">Delete ({assetCounts.Delete})</option>
                <option value="Transfer">Transfer ({assetCounts.Transfer})</option>
                <option value="Memorialize">Memorialize ({assetCounts.Memorialize})</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="text-2xl font-bold text-red-600 mb-1">{assetCounts.Delete}</div>
              <div className="text-sm text-red-600">Delete</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600 mb-1">{assetCounts.Transfer}</div>
              <div className="text-sm text-blue-600">Transfer</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{assetCounts.Memorialize}</div>
              <div className="text-sm text-yellow-600">Memorialize</div>
            </div>
          </div>
        </div>

        {/* Assets List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">
                {searchTerm || filterAction !== 'all' ? 'No matching assets' : 'No assets yet'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm || filterAction !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'Add your first digital asset to get started'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssets.map((asset, index) => (
                <motion.div 
                  key={asset.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AssetCard
                    asset={asset}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AssetModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingAsset(null)
        }}
        onSave={handleEditSave}
        asset={editingAsset ? assets.find(a => a.id === editingAsset) : undefined}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Asset</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete{' '}
                  <span className="font-medium text-gray-900">
                    {deletingAssetData?.platform_name}
                  </span>
                  ? This will permanently remove it from your digital will.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Toast */}
      <AlertToast
        isVisible={alert.isVisible}
        type={alert.type}
        title={alert.title}
        description={alert.description}
        actionType={alert.actionType}
        onClose={hideAlert}
      />
    </div>
  )
}
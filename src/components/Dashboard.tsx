import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, AlertTriangle, CheckCircle2, BarChart3, Users, Shield, Calendar, TrendingUp, Archive, Plus, Activity, Trash2, Upload, X, Edit, Trash } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useDigitalAssets } from '../hooks/useDigitalAssets'
import { useCheckins } from '../hooks/useCheckins'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ExecutionSummary } from './ExecutionSummary'
import { AssetModal } from './AssetModal'
import { NewAssetModal } from './NewAssetModal'
import { FileUploadModal } from './FileUploadModal'
import { AlertToast } from './AlertToast'

export function Dashboard() {
  const { userProfile } = useAuth()
  const { assets, loading: assetsLoading, addAsset, refetch: refetchAssets } = useDigitalAssets()
  const { checkin, performCheckin, getStatus, getTimeUntilTrigger, getNextCheckinDate } = useCheckins()
  const [showExecution, setShowExecution] = useState(false)
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string
    type: 'checkin' | 'asset_added' | 'asset_updated' | 'asset_deleted'
    title: string
    description: string
    timeAgo: string
    timestamp: Date
  }>>([])
  const [deletedAssets, setDeletedAssets] = useState<Array<{
    id: string
    platform_name: string
    action: string
    deleted_at: Date
  }>>([])
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

  const status = getStatus()

  // Load deleted assets from localStorage on mount
  useEffect(() => {
    const loadDeletedAssets = () => {
      const stored = localStorage.getItem('deletedAssets')
      if (stored) {
        try {
          const parsedDeleted = JSON.parse(stored).map((item: any) => ({
            ...item,
            deleted_at: new Date(item.deleted_at)
          }))
          
          // Remove any potential duplicates based on ID and timestamp proximity
          const uniqueDeleted = parsedDeleted.filter((item: any, index: number, array: any[]) => {
            return array.findIndex((other: any) => 
              other.id === item.id && 
              Math.abs(new Date(other.deleted_at).getTime() - new Date(item.deleted_at).getTime()) < 5000
            ) === index
          })
          
          setDeletedAssets(uniqueDeleted)
        } catch (error) {
          console.error('Error parsing stored deleted assets:', error)
        }
      }
    }

    loadDeletedAssets()

    // Listen for localStorage changes (when assets are deleted from other components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'deletedAssets') {
        loadDeletedAssets()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events for same-tab updates
    const handleDeletedAssetsUpdate = () => {
      loadDeletedAssets()
    }
    
    window.addEventListener('deletedAssetsUpdated', handleDeletedAssetsUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('deletedAssetsUpdated', handleDeletedAssetsUpdate)
    }
  }, [])

  // Update recent activities whenever assets, checkin data, or deletedAssets changes
  useEffect(() => {
    const activities: Array<{
      id: string
      type: 'checkin' | 'asset_added' | 'asset_updated' | 'asset_deleted'
      title: string
      description: string
      timeAgo: string
      timestamp: Date
    }> = []

    // Add check-in activity
    if (checkin) {
      activities.push({
        id: `checkin-${checkin.id}`,
        type: 'checkin',
        title: 'System Check-in',
        description: 'Dead man\'s switch timer reset',
        timeAgo: getTimeAgo(new Date(checkin.last_checkin_at)),
        timestamp: new Date(checkin.last_checkin_at)
      })
    }

    // Add deleted asset activities
    deletedAssets.forEach((deletedAsset) => {
      activities.push({
        id: `asset-deleted-${deletedAsset.id}`,
        type: 'asset_deleted',
        title: `${deletedAsset.platform_name} deleted`,
        description: `${deletedAsset.action} asset removed`,
        timeAgo: getTimeAgo(deletedAsset.deleted_at),
        timestamp: deletedAsset.deleted_at
      })
    })

    // Add all asset activities (creation and updates)
    assets.forEach((asset) => {
      // Add creation activity
      activities.push({
        id: `asset-created-${asset.id}`,
        type: 'asset_added',
        title: `${asset.platform_name} added`,
        description: `${asset.action}`,
        timeAgo: getTimeAgo(new Date(asset.created_at)),
        timestamp: new Date(asset.created_at)
      })

      // Add update activity if asset was updated (created_at !== updated_at)
      if (asset.updated_at && asset.created_at !== asset.updated_at) {
        // Calculate time difference to make sure it's actually a meaningful update
        const createdTime = new Date(asset.created_at).getTime()
        const updatedTime = new Date(asset.updated_at).getTime()
        
        // Only show as update if updated more than 1 second after creation
        if (updatedTime > createdTime + 1000) {
          activities.push({
            id: `asset-updated-${asset.id}`,
            type: 'asset_updated',
            title: `${asset.platform_name} updated`,
            description: `Action: ${asset.action}`,
            timeAgo: getTimeAgo(new Date(asset.updated_at)),
            timestamp: new Date(asset.updated_at)
          })
        }
      }
    })

    // Sort by timestamp (most recent first) and take only the most recent 5-6 activities for the recent activity section
    const sortedActivities = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    console.log('Recent activities generated:', sortedActivities.length, 'activities')
    console.log('Update activities:', sortedActivities.filter(a => a.type === 'asset_updated'))
    setRecentActivities(sortedActivities.slice(0, 6))
  }, [assets, checkin, deletedAssets])

  const handleCheckin = async () => {
    try {
      await performCheckin()
    } catch (error) {
      console.error('Checkin failed:', error)
    }
  }

  const handleAssetSave = async (data: any) => {
    try {
      console.log('Dashboard handleAssetSave called with:', data)
      await addAsset(data)
      showAlert('success', 'Asset Added', `${data.platform_name} asset has been added successfully.`, data.action)
      setShowAssetModal(false)
    } catch (error) {
      console.error('Failed to save asset in Dashboard:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      showAlert('error', 'Error', `Failed to create asset: ${error instanceof Error ? error.message : 'Please try again'}`)
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

  const getStatusColor = () => {
    switch (status) {
      case 'alive': return 'text-green-600'
      case 'triggered': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'alive': return <CheckCircle2 className="w-5 h-5" />
      case 'triggered': return <AlertTriangle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'alive': return 'Active'
      case 'triggered': return 'Triggered'
      default: return 'Never checked in'
    }
  }

  const getDisplayName = () => {
    return userProfile?.username || 'User'
  }

  // Helper function to format time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Function to get recent activities
  // Function to get all activities
  const getAllActivities = () => {
    const activities: Array<{
      id: string
      type: 'checkin' | 'asset_added' | 'asset_updated' | 'asset_deleted'
      title: string
      description: string
      timeAgo: string
      timestamp: Date
    }> = []

    // Add check-in activity
    if (checkin) {
      activities.push({
        id: `checkin-${checkin.id}`,
        type: 'checkin',
        title: 'System Check-in',
        description: 'Dead man\'s switch timer reset',
        timeAgo: getTimeAgo(new Date(checkin.last_checkin_at)),
        timestamp: new Date(checkin.last_checkin_at)
      })
    }

    // Add deleted asset activities
    deletedAssets.forEach((deletedAsset) => {
      activities.push({
        id: `asset-deleted-${deletedAsset.id}`,
        type: 'asset_deleted',
        title: `${deletedAsset.platform_name} deleted`,
        description: `${deletedAsset.action} asset removed`,
        timeAgo: getTimeAgo(deletedAsset.deleted_at),
        timestamp: deletedAsset.deleted_at
      })
    })

    // Add asset activities (all assets)
    assets.forEach((asset) => {
      // Add creation activity
      activities.push({
        id: `asset-created-${asset.id}`,
        type: 'asset_added',
        title: `${asset.platform_name} added`,
        description: `${asset.action}`,
        timeAgo: getTimeAgo(new Date(asset.created_at)),
        timestamp: new Date(asset.created_at)
      })

      // Add update activity if asset was updated (created_at !== updated_at)
      if (asset.updated_at && asset.created_at !== asset.updated_at) {
        // Calculate time difference to make sure it's actually a meaningful update
        const createdTime = new Date(asset.created_at).getTime()
        const updatedTime = new Date(asset.updated_at).getTime()
        
        // Only show as update if updated more than 1 second after creation
        if (updatedTime > createdTime + 1000) {
          activities.push({
            id: `asset-updated-${asset.id}`,
            type: 'asset_updated',
            title: `${asset.platform_name} updated`,
            description: `Action: ${asset.action}`,
            timeAgo: getTimeAgo(new Date(asset.updated_at)),
            timestamp: new Date(asset.updated_at)
          })
        }
      }
    })

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Calculate analytics
  const totalAssets = assets.length
  const assetsByAction = assets.reduce((acc, asset) => {
    acc[asset.action] = (acc[asset.action] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const fileAssets = assets.filter(asset => asset.file_name).length
  const platformAssets = assets.filter(asset => !asset.file_name).length

  const daysSinceLastCheckin = checkin 
    ? Math.floor((new Date().getTime() - new Date(checkin.last_checkin_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  if (showExecution) {
    return <ExecutionSummary assets={assets} onBack={() => setShowExecution(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 truncate">
                    Welcome, {getDisplayName()}
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                    Your digital legacy is secure and protected
                  </p>
                </div>
                <div className="hidden sm:block ml-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Status Alert */}
          {status === 'triggered' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 sm:mb-8 bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="bg-red-100 rounded-full p-3 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-1">
                    Dead Man's Switch Triggered
                  </h3>
                  <p className="text-sm sm:text-base text-red-700">
                    Your digital legacy protocol has been activated. Review the execution summary.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowExecution(true)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  View Execution
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {/* Total Assets Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="bg-blue-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Assets</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{totalAssets}</p>
                <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500">
                  <span>{platformAssets} platforms</span>
                  <span className="hidden sm:inline mx-2">•</span>
                  <span>{fileAssets} files</span>
                </div>
              </div>
            </motion.div>

            {/* Switch Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 border hover:shadow-md transition-shadow ${
                status === 'alive' ? 'border-green-100' : 
                status === 'triggered' ? 'border-red-100' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className={`rounded-lg sm:rounded-xl p-2 sm:p-3 ${
                  status === 'alive' ? 'bg-green-50' : 
                  status === 'triggered' ? 'bg-red-50' : 'bg-gray-50'
                }`}>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6">{getStatusIcon()}</div>
                </div>
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                  status === 'alive' ? 'bg-green-400 animate-pulse' : 
                  status === 'triggered' ? 'bg-red-400 animate-pulse' : 'bg-gray-400'
                }`}></div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Switch Status</p>
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 ${getStatusColor()}`}>{getStatusText()}</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {status === 'alive' && getTimeUntilTrigger() 
                    ? `${getTimeUntilTrigger()} remaining`
                    : status === 'triggered'
                    ? 'Dead man\'s switch activated'
                    : 'Never checked in'
                  }
                </p>
              </div>
            </motion.div>

            {/* Delete Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="bg-red-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
                </div>
                <span className="text-xs font-medium text-red-600 bg-red-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  DELETE
                </span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Delete Actions</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-1 sm:mb-2">{assetsByAction.Delete || 0}</p>
                <p className="text-xs sm:text-sm text-gray-500">Assets to be deleted</p>
              </div>
            </motion.div>

            {/* Transfer Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="bg-blue-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  TRANSFER
                </span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Transfer Actions</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{assetsByAction.Transfer || 0}</p>
                <p className="text-xs sm:text-sm text-gray-500">Assets to be transferred</p>
              </div>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Quick Actions Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col"
            >
              <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
              
              <div className="p-4 sm:p-6 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckin}
                  className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl transition-colors ${
                    status === 'alive' 
                      ? 'bg-green-50 hover:bg-green-100 border border-green-200' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    status === 'alive' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      status === 'alive' ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Check In</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {status === 'alive' && getNextCheckinDate()
                        ? `Before: ${getNextCheckinDate()}`
                        : 'Confirm you\'re active (resets 7-day timer)'
                      }
                    </p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAssetModal(true)}
                  className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-purple-100 flex-shrink-0">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Add Asset</p>
                    <p className="text-xs sm:text-sm text-gray-500">Protect new digital asset</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFileUpload(true)}
                  className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-purple-100 flex-shrink-0">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Upload Files</p>
                    <p className="text-xs sm:text-sm text-gray-500">Upload digital assets</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activity</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAllActivities(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View All
                </motion.button>
              </div>
              
              <div className="flex-1 p-4 sm:p-6 pt-3 sm:pt-4">
                {assetsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : assets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium mb-2">No digital assets yet</p>
                    <p className="text-sm text-gray-400">
                      Start protecting your digital legacy by adding your first asset
                    </p>
                  </div>
                ) : (
                  <div 
                    key={`activities-${assets.length}-${checkin?.last_checkin_at || 'no-checkin'}-${deletedAssets.length}`}
                    className="space-y-2 sm:space-y-3"
                  >
                    {recentActivities.slice(0, 4).map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'checkin' ? 'bg-green-100' :
                          activity.type === 'asset_added' ? 
                            (activity.description === 'Delete' ? 'bg-red-100' :
                             activity.description === 'Archive' ? 'bg-yellow-100' :
                             'bg-blue-100') :
                          activity.type === 'asset_updated' ? 'bg-orange-100' :
                          activity.type === 'asset_deleted' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {activity.type === 'checkin' ? (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          ) : activity.type === 'asset_added' ? (
                            <Plus className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              activity.description === 'Delete' ? 'text-red-600' :
                              activity.description === 'Archive' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                          ) : activity.type === 'asset_updated' ? (
                            <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                          ) : activity.type === 'asset_deleted' ? (
                            <Trash className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          ) : (
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{activity.title}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {activity.description} • {activity.timeAgo}
                          </p>
                        </div>
                        <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                          activity.type === 'checkin' ? 'bg-green-100 text-green-700' :
                          activity.type === 'asset_added' ? 'bg-blue-100 text-blue-700' :
                          activity.type === 'asset_updated' ? 'bg-orange-100 text-orange-700' :
                          activity.type === 'asset_deleted' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {activity.type === 'checkin' ? 'Check-in' :
                           activity.type === 'asset_added' ? 'Added' :
                           activity.type === 'asset_updated' ? 'Updated' :
                           activity.type === 'asset_deleted' ? 'Deleted' : 'Activity'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* System Status Footer */}
          {checkin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-gray-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">System Status</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      Last check-in: {new Date(checkin.last_checkin_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            </motion.div>
          )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <NewAssetModal
        isOpen={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        onSave={handleAssetSave}
      />

      <FileUploadModal
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onSave={handleFileUploadSave}
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

      {/* All Activities Modal */}
      <AnimatePresence>
        {showAllActivities && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAllActivities(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">All Activities</h2>
                <button
                  onClick={() => setShowAllActivities(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {getAllActivities().length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium mb-2">No activities yet</p>
                    <p className="text-sm text-gray-400">
                      Activities will appear here as you use the system
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getAllActivities().map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'checkin' ? 'bg-green-100' :
                          activity.type === 'asset_added' ? 
                            (activity.description === 'Delete' ? 'bg-red-100' :
                             activity.description === 'Archive' ? 'bg-yellow-100' :
                             'bg-blue-100') :
                          activity.type === 'asset_updated' ? 'bg-orange-100' :
                          activity.type === 'asset_deleted' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {activity.type === 'checkin' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : activity.type === 'asset_added' ? (
                            <Plus className={`w-5 h-5 ${
                              activity.description === 'Delete' ? 'text-red-600' :
                              activity.description === 'Archive' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                          ) : activity.type === 'asset_updated' ? (
                            <Edit className="w-5 h-5 text-orange-600" />
                          ) : activity.type === 'asset_deleted' ? (
                            <Trash className="w-5 h-5 text-red-600" />
                          ) : (
                            <Activity className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">
                            {activity.description} • {activity.timeAgo}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                          activity.type === 'checkin' ? 'bg-green-100 text-green-700' :
                          activity.type === 'asset_added' ? 'bg-blue-100 text-blue-700' :
                          activity.type === 'asset_updated' ? 'bg-orange-100 text-orange-700' :
                          activity.type === 'asset_deleted' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {activity.type === 'checkin' ? 'Check-in' :
                           activity.type === 'asset_added' ? 'Added' :
                           activity.type === 'asset_updated' ? 'Updated' :
                           activity.type === 'asset_deleted' ? 'Deleted' : 'Activity'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
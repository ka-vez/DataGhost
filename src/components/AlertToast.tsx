import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, AlertTriangle, Info, XCircle } from 'lucide-react'

interface AlertToastProps {
  isVisible: boolean
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  autoHide?: boolean
  autoHideDelay?: number
  onClose: () => void
  actionType?: 'Delete' | 'Transfer' | 'Archive'
}

export function AlertToast({
  isVisible,
  type,
  title,
  description,
  autoHide = true,
  autoHideDelay = 3000,
  onClose,
  actionType
}: AlertToastProps) {
  const [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true)
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsShowing(false)
          // Wait for animation to complete before calling onClose
          setTimeout(onClose, 300)
        }, autoHideDelay)
        
        return () => clearTimeout(timer)
      }
    } else {
      setIsShowing(false)
    }
  }, [isVisible, autoHide, autoHideDelay, onClose])

  const handleClose = () => {
    setIsShowing(false)
    setTimeout(onClose, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />
      case 'error':
        return <XCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      default:
        return <CheckCircle2 className="w-5 h-5" />
    }
  }

  const getColorClasses = () => {
    // If actionType is specified, use action-specific colors
    if (actionType) {
      switch (actionType) {
        case 'Delete':
          return {
            container: 'bg-red-50 border-red-200',
            icon: 'text-red-600',
            title: 'text-red-900',
            description: 'text-red-700',
            closeButton: 'text-red-400 hover:text-red-600'
          }
        case 'Transfer':
          return {
            container: 'bg-blue-50 border-blue-200',
            icon: 'text-blue-600',
            title: 'text-blue-900',
            description: 'text-blue-700',
            closeButton: 'text-blue-400 hover:text-blue-600'
          }
        case 'Archive':
          return {
            container: 'bg-yellow-50 border-yellow-200',
            icon: 'text-yellow-600',
            title: 'text-yellow-900',
            description: 'text-yellow-700',
            closeButton: 'text-yellow-400 hover:text-yellow-600'
          }
        default:
          return {
            container: 'bg-green-50 border-green-200',
            icon: 'text-green-600',
            title: 'text-green-900',
            description: 'text-green-700',
            closeButton: 'text-green-400 hover:text-green-600'
          }
      }
    }

    // Default type-based colors
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-900',
          description: 'text-green-700',
          closeButton: 'text-green-400 hover:text-green-600'
        }
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-900',
          description: 'text-red-700',
          closeButton: 'text-red-400 hover:text-red-600'
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          description: 'text-yellow-700',
          closeButton: 'text-yellow-400 hover:text-yellow-600'
        }
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          description: 'text-blue-700',
          closeButton: 'text-blue-400 hover:text-blue-600'
        }
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-900',
          description: 'text-gray-700',
          closeButton: 'text-gray-400 hover:text-gray-600'
        }
    }
  }

  const colors = getColorClasses()

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ 
              opacity: isShowing ? 1 : 0, 
              y: isShowing ? 0 : -50, 
              scale: isShowing ? 1 : 0.9 
            }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative rounded-lg border p-4 shadow-lg ${colors.container}`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 ${colors.icon}`}>
                {getIcon()}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${colors.title}`}>
                  {title}
                </h4>
                {description && (
                  <p className={`mt-1 text-sm ${colors.description}`}>
                    {description}
                  </p>
                )}
              </div>
              
              <button
                onClick={handleClose}
                className={`flex-shrink-0 p-1 rounded-md transition-colors ${colors.closeButton}`}
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {autoHide && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-bl-lg"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: autoHideDelay / 1000, ease: "linear" }}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

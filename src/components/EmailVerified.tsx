import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Mail, Shield } from 'lucide-react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'

export function EmailVerified() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Extract email from URL parameters if available
    const emailParam = searchParams.get('email')
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }

    // Check if we have tokens indicating successful verification
    if (accessToken || refreshToken) {
      setIsVerified(true)
    }

    setLoading(false)
  }, [searchParams])

  const handleGoToLogin = () => {
    // Navigate to auth page with email pre-filled and in login mode
    navigate('/auth', { 
      state: { 
        prefilledEmail: email,
        isSignUp: false,
        emailVerified: true
      } 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Header with logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">DataGhost</h1>
          
          {isVerified ? (
            <>
              {/* Success state */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Email Verified Successfully!
              </h2>
              
              <p className="text-gray-600 mb-6">
                {email ? (
                  <>
                    Your email address <strong>{email}</strong> has been verified. 
                    You can now sign in to your DataGhost account.
                  </>
                ) : (
                  "Your email address has been verified. You can now sign in to your DataGhost account."
                )}
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleGoToLogin}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Continue to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <Link
                  to="/"
                  className="block w-full px-6 py-3 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Error/unverified state */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10 text-red-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Required
              </h2>
              
              <p className="text-gray-600 mb-6">
                We couldn't verify your email address. Please check your email for the verification link 
                or request a new verification email.
              </p>

              <div className="space-y-4">
                <Link
                  to="/auth"
                  state={{ isSignUp: false }}
                  className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Go to Sign In
                </Link>
                
                <Link
                  to="/auth"
                  state={{ isSignUp: true }}
                  className="block w-full px-6 py-3 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Create New Account
                </Link>
              </div>
            </>
          )}

          {/* Additional info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Having trouble? Contact our support team at{' '}
              <a href="mailto:support@dataghost.com" className="text-blue-600 hover:underline">
                support@dataghost.com
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

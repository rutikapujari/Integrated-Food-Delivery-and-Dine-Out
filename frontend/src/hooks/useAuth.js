import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser, verifyOTP, logoutUser, clearError } from '../redux/authSlice'
import { notify } from '../utils/toast'

export function useAuth() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth)

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(result)) {
      notify.success('Signed in successfully')
      return result.payload
    }
    notify.error(result.payload || 'Login failed')
    return null
  }

  const register = async (data) => {
    const result = await dispatch(registerUser(data))
    if (registerUser.fulfilled.match(result)) {
      notify.success('Account created! Please verify your email.')
      return result.payload
    }
    notify.error(result.payload || 'Registration failed')
    return null
  }

  const verify = async (email, otp) => {
    const result = await dispatch(verifyOTP({ email, otp }))
    if (verifyOTP.fulfilled.match(result)) {
      notify.success('Email verified! Welcome aboard.')
      navigate('/')
      return result.payload
    }
    notify.error(result.payload || 'Invalid OTP')
    return null
  }

  const logout = async () => {
    await dispatch(logoutUser())
    notify.success('Signed out')
    navigate('/login')
  }

  const clearAuthError = () => dispatch(clearError())

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    verify,
    logout,
    clearAuthError,
    isAdmin: user?.role === 'admin' || user?.role === 'restaurant_admin',
  }
}

import { useState, useContext } from 'react';
import { API_URL, ERROR_MESSAGES, ROLES } from './config';
import { AuthContext } from './AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Your existing login logic
      const response = await fetch(`${API_URL}/login_admin.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const textResponse = await response.text();
      let result;
      try {
        result = JSON.parse(textResponse);
      } catch {
        throw new Error('Invalid JSON response: ' + textResponse.substring(0, 100));
      }

      if (result.status === 'success') {
        if (result.user.role !== ROLES.ADMIN && result.user.role !== ROLES.BFP) {
          setError(ERROR_MESSAGES.ACCESS_DENIED);
          return;
        }
        login(result.user, result.token);
      } else {
        setError(result.message || ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Failed to fetch') {
        setError('Cannot connect to server. Please check your network connection and ensure the API server is running.');
      } else {
        setError(ERROR_MESSAGES.NETWORK_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-50 to-red-50">
      {/* Left Panel - Branding and Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-700 via-orange-600 to-yellow-500 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated flame background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-400 rounded-full filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-orange-400 rounded-full filter blur-xl animate-pulse delay-300"></div>
          <div className="absolute top-2/3 left-1/3 w-28 h-28 bg-red-500 rounded-full filter blur-xl animate-pulse delay-700"></div>
        </div>
        
        <div className="relative z-10 flex items-center">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg mr-3 shadow-lg">
            <svg className="w-7 h-7 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white font-josefin-sans">HazardTrack</h1>
        </div>
        
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold text-white mb-6 font-josefin-sans">BFP Admin Portal</h2>
          <p className="text-orange-100 text-lg mb-8 font-light">
            Monitor and manage fire hazard reports with our advanced dashboard system designed for emergency response teams.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-800 flex items-center justify-center mr-3 shadow-md">
                <svg className="w-5 h-5 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-orange-100 font-medium">Real-time hazard monitoring</p>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-800 flex items-center justify-center mr-3 shadow-md">
                <svg className="w-5 h-5 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-orange-100 font-medium">GPS-enabled response tracking</p>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-800 flex items-center justify-center mr-3 shadow-md">
                <svg className="w-5 h-5 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-orange-100 font-medium">Advanced analytics & reporting</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center text-orange-200 text-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure authentication for authorized personnel only
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-lg mr-3 shadow-md">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 font-josefin-sans">HazardTrack</h1>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-red-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 font-josefin-sans">Admin Portal</h2>
              <p className="mt-2 text-sm text-gray-600 font-medium">Enter your credentials to access the dashboard</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                    Email Address
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-md border font-montserrat"
                      placeholder="admin@bfp.gov.ph"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
                    Password
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 pr-10 py-3 text-sm border-gray-300 rounded-md border font-montserrat"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-orange-500 focus:outline-none focus:text-orange-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-montserrat">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-orange-600 hover:text-orange-500 transition duration-200 font-montserrat">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-200 disabled:opacity-75 disabled:cursor-not-allowed shadow-md font-montserrat"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 font-montserrat">
              &copy; {new Date().getFullYear()} Bureau of Fire Protection - Tagudin. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { GoogleLogin } from '@react-oauth/google';
import { Building2, KeyRound, Mail, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, googleLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (credentialResponse.credential) {
        await googleLogin(credentialResponse.credential);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="min-h-screen bg-government-lightgray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-lg rounded-xl flex flex-col items-center">
        
        <div className="flex flex-col items-center w-full">
          <Building2 className="h-16 w-16 text-government-navy mb-4" />
          <h2 className="text-center text-3xl font-bold text-government-navy font-sans tracking-tight">
            ConfConnect Portal
          </h2>
          <p className="mt-2 text-center text-sm text-government-darkgray">
            Sign in to access conference room bookings
          </p>
        </div>

        {error && (
          <div className="w-full bg-red-50 border-l-4 border-red-500 p-4 rounded mt-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="w-full mt-8 space-y-6" onSubmit={handleStandardLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-government-blue focus:border-government-blue sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-government-blue focus:border-government-blue sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-government-navy hover:bg-government-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-government-blue transition-colors duration-200"
            >
              Sign in securely
            </button>
          </div>
        </form>

        <div className="w-full mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google Login Failed');
              }}
              useOneTap
              size="large"
              shape="pill"
            />
          </div>
        </div>

        <div className="text-sm mt-4 text-center pb-4">
          <Link to="/register" className="font-medium text-government-blue hover:text-government-navy">
            Need an account? Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Building2, Mail, Lock, User, Phone, Briefcase } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await register(formData);
      setSuccess(response.message || 'Registration successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
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
            Register Account
          </h2>
          <p className="mt-2 text-center text-sm text-government-darkgray">
            Create an access account for the ConfConnect system
          </p>
        </div>

        {error && (
          <div className="w-full bg-red-50 border-l-4 border-red-500 p-4 rounded mt-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="w-full bg-green-50 border-l-4 border-green-500 p-4 rounded mt-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form className="w-full mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            
            <div className="mb-4">
              <label className="sr-only">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" name="name" required placeholder="Full Name" value={formData.name} onChange={handleChange}
                  className="appearance-none rounded-t-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-government-blue focus:border-government-blue sm:text-sm" />
              </div>
            </div>

            <div className="mb-4 border-t border-gray-200 pt-4">
              <label className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input type="email" name="email" required placeholder="Organization Email" value={formData.email} onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-government-blue focus:border-government-blue sm:text-sm" />
              </div>
            </div>

            <div className="mb-4 border-t border-gray-200 pt-4">
              <label className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" name="password" required placeholder="Password" value={formData.password} onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-government-blue focus:border-government-blue sm:text-sm" />
              </div>
            </div>

            <div className="flex gap-4 border-t border-gray-200 pt-4">
              <div className="relative w-1/2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange}
                  className="appearance-none rounded-bl-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-government-blue focus:border-government-blue sm:text-sm" />
              </div>
              <div className="relative w-1/2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" name="phone" placeholder="Phone (opt)" value={formData.phone} onChange={handleChange}
                  className="appearance-none rounded-br-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-government-blue focus:border-government-blue sm:text-sm" />
              </div>
            </div>

          </div>

          <div>
            <button type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-government-navy hover:bg-government-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-government-blue transition-colors duration-200"
            >
              Secure Registration
            </button>
          </div>
        </form>

        <div className="text-sm mt-4 text-center pb-4">
          <Link to="/login" className="font-medium text-government-blue hover:text-government-navy">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;


import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const toggleLanguageSelector = () => {
    setShowLanguageSelector(!showLanguageSelector);
  };

  const changeLanguage = (lang: "en") => {
    setLanguage(lang);
    setShowLanguageSelector(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-mywater-blue text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">MyWater</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to="/auth" 
              className="px-4 py-2 bg-white text-mywater-blue rounded-md hover:bg-gray-100 transition-colors"
            >
              Business Login
            </Link>
            <Link 
              to="/private-auth" 
              className="px-4 py-2 border border-white text-white rounded-md hover:bg-white/10 transition-colors"
            >
              Customer Login
            </Link>
            <div className="relative">
              <button 
                onClick={toggleLanguageSelector}
                className="flex items-center space-x-1 text-sm opacity-80 hover:opacity-100"
              >
                <span>Language: {language.toUpperCase()}</span>
              </button>

              {showLanguageSelector && (
                <div className="absolute right-0 mt-2 bg-white text-gray-800 rounded-md shadow-lg p-2 w-32">
                  <button 
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-100 ${language === "en" ? "bg-gray-100 font-medium" : ""}`}
                    onClick={() => changeLanguage("en")}
                  >
                    English
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow bg-gradient-to-b from-mywater-blue/5 to-white">
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-mywater-blue mb-6">Smart Water Management</h1>
            <p className="text-xl text-gray-600 mb-8">Advanced solutions for monitoring and optimizing water usage in real-time.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/auth" 
                className="px-8 py-3 bg-mywater-blue text-white rounded-md hover:bg-mywater-blue/90 transition-colors text-lg font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-mywater-blue/10 text-mywater-blue rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Monitoring</h3>
              <p className="text-gray-600">Monitor water quality, usage, and system status in real-time with our advanced IoT sensors.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-mywater-blue/10 text-mywater-blue rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">Gain insights into water consumption patterns with powerful analytics and visualization tools.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-mywater-blue/10 text-mywater-blue rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Maintenance Alerts</h3>
              <p className="text-gray-600">Receive timely notifications for maintenance needs, filter replacements, and potential issues.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">MyWater</h3>
              <p className="text-gray-400">Advanced water management solutions for businesses and residential users.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/auth" className="text-gray-400 hover:text-white transition-colors">Business Portal</Link></li>
                <li><Link to="/private-auth" className="text-gray-400 hover:text-white transition-colors">Customer Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">contact@mywater.com</p>
              <p className="text-gray-400">+1 (555) 123-4567</p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} MyWater. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

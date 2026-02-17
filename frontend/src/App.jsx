import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
// Removed language support
import AuthProvider from './contexts/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { productListingService, orderService } from './services/api';
import './App.css';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import PostRequirementForm from './components/PostRequirementForm';
import BuyerDashboard from './pages/BuyerDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import RatingSystem from './pages/RatingSystem';
import NotificationSystem from './pages/NotificationSystem';
import TestAuthComponent from './pages/TestAuthComponent';
import TestBuyerPosting from './pages/TestBuyerPosting';
import ProtectedRoute from './components/ProtectedRoute';

// Navigation Component
function Navigation() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="header">
      <nav className="navbar" style={{ position: 'relative' }}>
        <Link to="/" className="logo">
          <span className="logo-icon">🌾</span>
          GreenFarmIQ
        </Link>
        <button
          aria-label="Toggle menu"
          className="mobile-nav-toggle"
          onClick={() => setOpen(v => !v)}
        >
          ☰
        </button>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          {!isAuthenticated ? (
            <>
              <Link to="/view-requirements" className="nav-link">View Requirements</Link>
              <button onClick={() => navigate('/login')} className="btn-action btn-bid">Sign In</button>
              <button onClick={() => navigate('/register')} className="btn-action btn-post">Register</button>
            </>
          ) : (
            <>
              {user?.userType === 'buyer' && (
                <>
                  <Link to="/buyer-dashboard" className="nav-link">Buyer Dashboard</Link>
                  <Link to="/post-requirement" className="nav-link">Post Requirement</Link>
                </>
              )}
              {user?.userType === 'farmer' && (
                <>
                  <Link to="/farmer-dashboard" className="nav-link">Farmer Dashboard</Link>
                  <Link to="/view-requirements" className="nav-link">View Requirements</Link>
                </>
              )}
              <Link to="/my-orders" className="nav-link">My Orders</Link>
              <Link to="/ratings" className="nav-link">Ratings</Link>
              <Link to="/notifications" className="nav-link">Notifications</Link>
              {user?.userType === 'admin' && <Link to="/admin" className="nav-link">Admin</Link>}
              <button onClick={handleLogout} className="btn-action btn-bid">Logout</button>
            </>
          )}
        </div>
        {open && (
          <div className="mobile-menu" onClick={() => setOpen(false)}>
            <Link to="/">Home</Link>
            {!isAuthenticated ? (
              <>
                <Link to="/view-requirements">View Requirements</Link>
                <button onClick={() => navigate('/login')} className="btn-action btn-bid">Sign In</button>
                <button onClick={() => navigate('/register')} className="btn-action btn-post">Register</button>
              </>
            ) : (
              <>
                {user?.userType === 'buyer' && (
                  <>
                    <Link to="/buyer-dashboard">Buyer Dashboard</Link>
                    <Link to="/post-requirement">Post Requirement</Link>
                    <Link to="/my-orders">My Orders</Link>
                  </>
                )}
                {user?.userType === 'farmer' && (
                  <>
                    <Link to="/farmer-dashboard">Farmer Dashboard</Link>
                    <Link to="/view-requirements">View Requirements</Link>
                    <Link to="/my-orders">My Orders</Link>
                  </>
                )}
                {user?.userType === 'admin' && <Link to="/admin">Admin</Link>}
                <Link to="/ratings">Ratings</Link>
                <Link to="/notifications">Notifications</Link>
                <button onClick={handleLogout} className="btn-action btn-secondary">Logout</button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

// Login Page
function LoginPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const role = params.get('role');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Client-side validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }
    
    const result = await login(email, password);
    
    if (result.success) {
      // Check if there's a redirect path stored in session storage
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath && redirectPath !== '/login' && redirectPath !== '/') {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        // Redirect based on user type
        // The navigation will be handled by the ProtectedRoute component
        navigate('/');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };
  
  return (
    <div className="main-container">
      <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <h2 className="page-title">Sign In{role ? ` as ${role.charAt(0).toUpperCase() + role.slice(1)}` : ''}</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              className="form-control" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="form-control" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn-action btn-bid w-full mt-4" 
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center mt-4">
          Don't have an account? <Link to="/register" className="text-farm-dark-green font-semibold">Register here</Link>
        </p>
      </div>
    </div>
  );
}

// Register Page
function RegisterPage() {
  const [userType, setUserType] = useState('farmer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    farmDetails: '',
    businessType: 'hotel'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Client-side validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    
    // Prepare registration data
    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      location: formData.location,
      userType: userType,
      ...(userType === 'farmer' && { farmDetails: formData.farmDetails }),
      ...(userType === 'buyer' && { businessDetails: { businessType: formData.businessType } })
    };
    
    const result = await register(registrationData);
    
    if (result.success) {
      // Check if there's a redirect path stored in session storage
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath && redirectPath !== '/login' && redirectPath !== '/') {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        // Redirect based on user type
        // The navigation will be handled by the ProtectedRoute component
        navigate('/');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };
  
  return (
    <div className="main-container">
      <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <h2 className="page-title">Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    checked={userType === 'farmer'}
                    onChange={() => setUserType('farmer')}
                    className="mr-2"
                  />
                  <span>Farmer</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    checked={userType === 'buyer'}
                    onChange={() => setUserType('buyer')}
                    className="mr-2"
                  />
                  <span>Buyer</span>
                </label>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                className="form-control" 
                placeholder="Your name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input 
                type="tel" 
                id="phone" 
                className="form-control" 
                placeholder="Your phone" 
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              className="form-control" 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="form-control" 
              placeholder="Create a password (min 6 chars)" 
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              required
            />
            <small className="text-gray-500">Password must be at least 6 characters</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input 
              type="text" 
              id="location" 
              className="form-control" 
              placeholder="City, State" 
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          
          {userType === 'farmer' && (
            <div className="form-group">
              <label htmlFor="farmDetails">Farm Details</label>
              <input 
                type="text" 
                id="farmDetails" 
                className="form-control" 
                placeholder="Farm size, crops grown" 
                value={formData.farmDetails}
                onChange={handleChange}
              />
            </div>
          )}
          
          {userType === 'buyer' && (
            <div className="form-group">
              <label htmlFor="businessType">Business Type</label>
              <select 
                id="businessType" 
                className="form-control"
                value={formData.businessType}
                onChange={handleChange}
              >
                <option value="hotel">Hotel</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="exporter">Exporter</option>
                <option value="retailer">Retailer</option>
              </select>
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn-action btn-post w-full mt-4"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account? <Link to="/login" className="text-farm-dark-green font-semibold">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

// View Requirements Page
function ViewRequirementsPage() {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dismissedKey = (() => {
    let uid = 'guest';
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        uid = u?._id || u?.id || uid;
      } else {
        uid = user?._id || user?.id || uid;
      }
    } catch {
      uid = user?._id || user?.id || 'guest';
    }
    return `gf_dismissed_${String(uid)}`;
  })();
  const dismissRequirement = (id) => {
    try {
      const set = new Set(JSON.parse(localStorage.getItem(dismissedKey) || '[]'));
      set.add(String(id));
      localStorage.setItem(dismissedKey, JSON.stringify([...set]));
      setRequirements(prev => prev.filter(r => String(r._id) !== String(id)));
    } catch (err) { console.warn('dismissRequirement failed', err); }
  };
  const resetDismissed = () => {
    try {
      localStorage.removeItem(dismissedKey);
      loadRequirements();
    } catch (err) { console.warn('resetDismissed failed', err); }
  };
  
  const loadRequirements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productListingService.getAllListings();
      const list = Array.isArray(response) ? response : (response.productListings || []);
      const set = new Set(JSON.parse(localStorage.getItem(dismissedKey) || '[]'));
      const filtered = list.filter(item => !set.has(String(item._id)));
      setRequirements(filtered);
      setError(null);
    } catch (err) {
      setError('Failed to load requirements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dismissedKey]);
  
  useEffect(() => {
    loadRequirements();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadRequirements();
    }, 30000); // 30 seconds
    
    // Listen for requirement posted events
    const handleRequirementPosted = () => {
      loadRequirements();
    };
    
    window.addEventListener('requirementPosted', handleRequirementPosted);
    
    // Cleanup interval and event listener on component unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('requirementPosted', handleRequirementPosted);
    };
  }, [loadRequirements]);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };
  
  if (loading) {
    return (
      <div className="main-container">
        <h1 className="page-title">Available Requirements</h1>
        <p>Loading requirements...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="main-container">
        <h1 className="page-title">Available Requirements</h1>
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="text-xl font-bold mb-2">Error Loading Requirements</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadRequirements}
            className="btn-action btn-bid"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  

  return (
    <div className="main-container">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">Available Requirements</h1>
          <p className="text-gray-600">Browse product requirements posted by buyers</p>
        </div>
        <div className="flex gap-2">
          {user?.userType === 'farmer' && (
            <button 
              onClick={resetDismissed}
              className="btn-action btn-secondary"
              title="Show all hidden requirements again"
            >
              Reset Hidden
            </button>
          )}
          <button 
            onClick={loadRequirements}
            className="btn-action btn-bid flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : 'Refresh'}
          </button>
        </div>
      </div>
      
      {requirements.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">No Requirements Available</h3>
          <p className="text-gray-600">Check back later for new buyer requirements</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.map(requirement => (
            <div key={requirement._id} className="card">
              <h3 className="text-lg font-bold mb-2">{requirement.title}</h3>
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Category:</span> {requirement.category}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Quantity:</span> {requirement.quantityRequired} {requirement.unit}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Budget:</span> ₹{requirement.budget?.minPrice || 0} - ₹{requirement.budget?.maxPrice}
              </p>
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">Location:</span> {requirement.deliveryLocation}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Posted by: {requirement.postedBy?.name}
              </p>
              <div className="flex justify-between items-start gap-3">
                <span className="text-sm text-gray-500">
                  {formatDate(requirement.createdAt)}
                </span>
                <div className="flex flex-col items-end gap-2">
                  {user?.userType === 'farmer' ? (
                    <button
                      onClick={() => navigate(`/offer/${requirement._id}`, { state: { req: requirement } })}
                      type="button"
                      className="btn-action btn-bid"
                    >
                      Place Bid
                    </button>
                  ) : user?.userType === 'buyer' ? (
                    <button
                      onClick={() => {
                        alert('You are not farmer. Please register as farmer to place offer');
                      }}
                      type="button"
                      className="btn-action btn-bid"
                    >
                      Place Bid
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        alert('Please sign in as a farmer to place an offer');
                        navigate('/register?role=farmer');
                      }}
                      type="button"
                      className="btn-action btn-bid"
                    >
                      Place Bid
                    </button>
                  )}
                  {user?.userType === 'farmer' && (
                    <button
                      onClick={() => dismissRequirement(requirement._id)}
                      type="button"
                      className="btn-action btn-secondary"
                    >
                      Not Interested
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
}

// Offer Page (dedicated route in case modal fails)
function OfferPage() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [req, setReq] = useState(location?.state?.req || null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ 
    name: (user?.name) || '', 
    city: (user?.location) || '', 
    quantity: '', 
    price: '', 
    email: (user?.email) || '' 
  });
  
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        let item = req;
        if (!item) {
          const res = await productListingService.getListingById(params.id);
          item = res?.productListing || res;
        }
        // Ensure postedBy has email populated; if missing, refetch by id
        if (item && (!item.postedBy || !item.postedBy.email)) {
          const res2 = await productListingService.getListingById(params.id);
          item = res2?.productListing || res2 || item;
        }
        setReq(item);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id, req]);
  
  const send = async (e) => {
    e.preventDefault();
    if (!req) return;
    if (!formData.name || !formData.city || !formData.quantity || !formData.price || !formData.email) {
      alert('Please fill Name, City, Quantity, Price, and Email.');
      return;
    }
    try {
      setSending(true);
      const directRes = await orderService.createDirectOrder({
        productListingId: params.id,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.price)
      });
      if (!directRes || directRes.success === false) {
        const msg = directRes?.message || directRes?.msg || 'Failed to create order';
        alert(msg);
        setSending(false);
        return;
      }
      const SERVICE_ID = (import.meta.env?.VITE_EMAILJS_SERVICE_ID) || window.VITE_EMAILJS_SERVICE_ID || (() => { try { return localStorage.getItem('emailjs_service_id') || ''; } catch { return ''; } })() || 'service_7bk854s';
      const TEMPLATE_ID = (import.meta.env?.VITE_EMAILJS_TEMPLATE_ID) || window.VITE_EMAILJS_TEMPLATE_ID || (() => { try { return localStorage.getItem('emailjs_template_id') || ''; } catch { return ''; } })() || 'template_sasriqf';
      const PUBLIC_KEY = (import.meta.env?.VITE_EMAILJS_PUBLIC_KEY) || window.VITE_EMAILJS_PUBLIC_KEY || (() => { try { return localStorage.getItem('emailjs_public_key') || ''; } catch { return ''; } })() || 'O5nV1iLn6oKn3kwEH';
      const emailjs = window.emailjs;
      if (!emailjs || !PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID) {
        alert('Email service not configured. Set EmailJS keys (service, template, public).');
        setSending(false);
        return;
      }
      try {
        emailjs.init(PUBLIC_KEY);
      } catch {
        /* ignore init failure */
      }
      // Attempt to ensure buyer email present; fallback to refresh if missing
      let buyerEmail = req?.postedBy?.email || '';
      if (!buyerEmail) {
        try {
          const res3 = await productListingService.getListingById(params.id);
          const item3 = res3?.productListing || res3;
          buyerEmail = item3?.postedBy?.email || '';
          if (item3) setReq(item3);
        } catch {/* ignore */}
      }
      if (!buyerEmail) {
        alert('Buyer email is not available for this requirement.');
        setSending(false);
        return;
      }
      const sv = (v, f = '') => (v === undefined || v === null ? f : String(v));
      const buyerName = sv(req?.postedBy?.name, 'Buyer');
      const paramsObj = {
        to_email: sv(buyerEmail),
        buyer_email: sv(buyerEmail),
        to_name: buyerName,
        subject: sv(`Offer for ${sv(req?.title, 'Product')}`),
        from_email: sv(formData.email),
        reply_to: sv(formData.email),
        email: sv(formData.email),
        farmer_name: sv(formData.name, 'Farmer'),
        farmer_city: sv(formData.city, ''),
        product_title: sv(req?.title, 'Product'),
        quantity: sv(formData.quantity, '1'),
        price: sv(formData.price, '0'),
        location: sv(req?.deliveryLocation, ''),
        message: sv(
          `Offer Details:
- Farmer: ${sv(formData.name)} (${sv(formData.city)})
- Price: ₹${sv(formData.price)}
- Product: ${sv(req?.title)}
- Delivery Location: ${sv(req?.deliveryLocation)}
- Contact: ${sv(formData.email)}`
        )
      };
      const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, paramsObj, PUBLIC_KEY);
      if (!(result && result.status === 200)) {
        console.warn('EmailJS unexpected result:', result);
      }
      try {
        const buyerName = String(req?.postedBy?.name || 'Buyer');
        const buyerMail = String(buyerEmail);
        const farmerName = String(formData.name);
        const farmerMail = String(formData.email);
        const subject = String(paramsObj.subject);
        const body = String(paramsObj.message);
        const listingId = String(params.id);
        const base = JSON.parse(localStorage.getItem('gf_notifications') || '[]');
        const now = new Date().toISOString();
        base.push({
          id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
          type: 'offer',
          targetRole: 'buyer',
          title: 'New Offer Received',
          message: `${farmerName} sent you an offer for ${req?.title}`,
          createdAt: now,
          read: false,
          data: {
            farmerName,
            farmerEmail: farmerMail,
            buyerName,
            buyerEmail: buyerMail,
            productTitle: String(req?.title || ''),
            listingId,
            subject,
            body
          }
        });
        base.push({
          id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
          type: 'offer',
          targetRole: 'farmer',
          title: 'Offer Sent',
          message: `Offer sent to ${buyerName} for ${req?.title}`,
          createdAt: now,
          read: false,
          data: {
            farmerName,
            farmerEmail: farmerMail,
            buyerName,
            buyerEmail: buyerMail,
            productTitle: String(req?.title || ''),
            listingId,
            subject,
            body
          }
        });
        localStorage.setItem('gf_notifications', JSON.stringify(base));
        window.dispatchEvent(new Event('gf_notifications_updated'));
      } catch (e) {
        console.warn('Notification cache update failed', e);
      }
      alert('Order created and your offer has been emailed to the buyer (check spam if not in inbox).');
      navigate('/my-orders?tab=orders');
    } catch (err) {
      alert(err?.text || err?.message || 'Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  if (loading) {
    return (
      <div className="main-container">
        <h1 className="page-title">Send Offer</h1>
        <p>Loading requirement...</p>
      </div>
    );
  }
  
  if (!req) {
    return (
      <div className="main-container">
        <h1 className="page-title">Send Offer</h1>
        <div className="card">Requirement not found.</div>
      </div>
    );
  }
  
  return (
    <div className="main-container">
      <h1 className="page-title">Send Offer</h1>
      <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <p className="text-sm text-gray-600 mb-4">
          Buyer: <span className="font-semibold">{req?.postedBy?.name}</span> • {req?.postedBy?.email || 'email not available'}
        </p>
        <div className="mb-4">
          <div className="font-semibold">{req?.title}</div>
          <div className="text-gray-600 text-sm">{req?.deliveryLocation}</div>
        </div>
        <form onSubmit={send} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Farmer Name</label>
            <input 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="form-control w-full"
              required
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input 
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="form-control w-full"
              required
              placeholder="Your city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input 
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              className="form-control w-full"
              required
              placeholder={String(req?.quantityRequired || 1)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (₹)</label>
            <input 
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="form-control w-full"
              required
              placeholder="e.g., 95"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Email</label>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="form-control w-full"
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => navigate('/view-requirements')} className="btn-action btn-secondary">Cancel</button>
            <button type="submit" disabled={sending} className="btn-action btn-bid">
              {sending ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Post Requirement Page
function PostRequirementPage() {
  const navigate = useNavigate();
  const handleSubmit = async (requirementData) => {
    try {
      const res = await productListingService.createListing(requirementData);
      if (res && (res.productListing || res._id || res.success)) {
        window.dispatchEvent(new Event('requirementPosted'));
        alert('Requirement posted successfully');
        navigate('/my-orders?tab=myListings');
      } else {
        const msg = res?.message || res?.msg || 'Failed to post requirement';
        alert(msg);
        if (String(msg).toLowerCase().includes('session expired') || String(msg).toLowerCase().includes('token')) {
          navigate('/login?role=buyer');
        }
      }
    } catch {
      alert('You must be logged in as a buyer to post a requirement');
    }
  };
  
  return (
    <div className="main-container">
      <h1 className="page-title">Post Your Requirement</h1>
      <p>As a buyer, post what you need and receive bids from farmers</p>
      
      <PostRequirementForm onSubmit={handleSubmit} />
    </div>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute allowedRoles={['buyer','farmer','admin']}>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat/:id" 
              element={
                <ProtectedRoute allowedRoles={['buyer','farmer','admin']}>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post-requirement" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <PostRequirementPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/offer/:id" element={<OfferPage />} />
            <Route path="/view-requirements" element={<ViewRequirementsPage />} />
            <Route path="/test-auth" element={<TestAuthComponent />} />
            <Route path="/test-buyer-posting" element={<TestBuyerPosting />} />
                      
            {/* Protected Routes */}
            <Route 
              path="/buyer-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/farmer-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/my-orders" 
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            {/* payments route removed */}
            <Route 
              path="/ratings" 
              element={
                <ProtectedRoute>
                  <RatingSystem />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <NotificationSystem />
                </ProtectedRoute>
              } 
            />
          </Routes>
          
          <footer className="footer">
            <div className="footer-content">
              <div className="footer-logo">GreenFarmIQ</div>
              <p>Connecting farmers directly with buyers since 2026</p>
              <p>© 2026 GreenFarmIQ - All rights reserved</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App

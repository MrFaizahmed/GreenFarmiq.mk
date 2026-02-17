const validator = require('validator');
const xss = require('xss');

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // Remove HTML tags and sanitize
    return xss(input.trim());
  } else if (typeof input === 'object' && input !== null) {
    // Recursively sanitize object properties
    const sanitized = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  } else if (Array.isArray(input)) {
    // Sanitize array elements
    return input.map(item => sanitizeInput(item));
  }
  return input;
};

// Validate email
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Validate phone number
const isValidPhone = (phone) => {
  // Basic phone validation - can be enhanced based on requirements
  return validator.isMobilePhone(phone, ['en-IN'], { strictMode: true }) || 
         validator.isNumeric(phone) && phone.length >= 10;
};

// Validate password strength
const isStrongPassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

// Validate basic password (minimum 6 characters)
const isBasicPassword = (password) => {
  return password.length >= 6;
};

// Validate price
const isValidPrice = (price) => {
  if (typeof price === 'number') {
    return Number.isFinite(price) && price > 0;
  }
  return validator.isFloat(String(price), { min: 0 }) && parseFloat(price) > 0;
};

// Validate quantity
const isValidQuantity = (quantity) => {
  if (typeof quantity === 'number') {
    return Number.isInteger(quantity) && quantity > 0;
  }
  return validator.isNumeric(String(quantity)) && parseInt(quantity) > 0;
};

// Validate URL
const isValidUrl = (url) => {
  return validator.isURL(url, { protocols: ['https', 'http'] });
};

// Validate alphanumeric string
const isValidAlphanumeric = (str) => {
  return validator.isAlphanumeric(str.replace(/\s/g, '')); // Allow spaces
};

// Sanitize and validate user registration data
const sanitizeUserData = (userData) => {
  const sanitized = {
    name: sanitizeInput(userData.name) || '',
    email: sanitizeInput(userData.email) || '',
    password: userData.password || '', // Don't sanitize password as it might contain special chars
    userType: sanitizeInput(userData.userType) || '',
    phone: sanitizeInput(userData.phone) || '',
    location: sanitizeInput(userData.location) || '',
    farmDetails: sanitizeInput(userData.farmDetails) || {},
    businessDetails: sanitizeInput(userData.businessDetails) || {}
  };

  // Validate email
  if (sanitized.email && !isValidEmail(sanitized.email)) {
    throw new Error('Invalid email format');
  }

  // Validate phone
  if (sanitized.phone && !isValidPhone(sanitized.phone)) {
    throw new Error('Invalid phone number format');
  }

  // Validate name (alphanumeric with spaces)
  if (sanitized.name && !isValidAlphanumeric(sanitized.name.replace(/\s/g, ''))) {
    throw new Error('Name should contain only letters, numbers, and spaces');
  }

  return sanitized;
};

// Sanitize and validate product listing data (Buyer requirement)
const sanitizeProductListingData = (listingData) => {
  const sanitized = {
    title: sanitizeInput(listingData.title) || '',
    description: sanitizeInput(listingData.description) || '',
    category: sanitizeInput(listingData.category) || '',
    quantityRequired: sanitizeInput(listingData.quantityRequired) || '',
    unit: sanitizeInput(listingData.unit) || '',
    qualityRequirements: sanitizeInput(listingData.qualityRequirements) || '',
    deliveryDate: sanitizeInput(listingData.deliveryDate) || '',
    deliveryLocation: sanitizeInput(listingData.deliveryLocation) || '',
    budget: sanitizeInput(listingData.budget) || {}
  };

  // Validate quantity
  if (sanitized.quantityRequired && !isValidQuantity(sanitized.quantityRequired)) {
    throw new Error('Invalid quantity format');
  }

  // Validate budget prices
  if (sanitized.budget) {
    const { minPrice, maxPrice } = sanitized.budget;
    if (maxPrice !== undefined && !isValidPrice(maxPrice)) {
      throw new Error('Invalid maximum budget format');
    }
    if (minPrice !== undefined && minPrice !== '' && minPrice !== null) {
      if (!isValidPrice(minPrice)) {
        throw new Error('Invalid minimum budget format');
      }
      if (maxPrice !== undefined && Number(minPrice) > Number(maxPrice)) {
        throw new Error('Minimum budget cannot exceed maximum budget');
      }
    }
  }

  return sanitized;
};

// Sanitize and validate bid data
const sanitizeBidData = (bidData) => {
  const sanitized = {
    productListingId: sanitizeInput(bidData.productListingId) || '',
    quantityOffered: sanitizeInput(bidData.quantityOffered) || '',
    unitPrice: sanitizeInput(bidData.unitPrice) || '',
    totalPrice: sanitizeInput(bidData.totalPrice) || '',
    deliveryDate: sanitizeInput(bidData.deliveryDate) || '',
    qualityInfo: sanitizeInput(bidData.qualityInfo) || ''
  };

  // Validate price
  if (sanitized.unitPrice && !isValidPrice(sanitized.unitPrice)) {
    throw new Error('Invalid unit price format');
  }

  // Validate total price
  if (sanitized.totalPrice && !isValidPrice(sanitized.totalPrice)) {
    throw new Error('Invalid total price format');
  }

  // Validate quantity
  if (sanitized.quantityOffered && !isValidQuantity(sanitized.quantityOffered)) {
    throw new Error('Invalid quantity format');
  }

  return sanitized;
};

module.exports = {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  isBasicPassword,
  isValidPrice,
  isValidQuantity,
  isValidUrl,
  isValidAlphanumeric,
  sanitizeUserData,
  sanitizeProductListingData,
  sanitizeBidData
};

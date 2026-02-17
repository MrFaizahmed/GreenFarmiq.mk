import React, { useState } from 'react';

const PostRequirementForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantityRequired: '',
    unit: 'kg',
    qualityRequirements: '',
    deliveryDate: '',
    deliveryLocation: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.category || 
        !formData.quantityRequired || !formData.deliveryDate || !formData.deliveryLocation || 
        !formData.maxPrice) {
      alert('Please fill in all required fields');
      return;
    }

    // Prepare data for submission
    const requirementData = {
      ...formData,
      quantityRequired: parseInt(formData.quantityRequired),
      budget: {
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : 0,
        maxPrice: parseFloat(formData.maxPrice)
      }
    };

    // Submit the form
    if (onSubmit) {
      onSubmit(requirementData);
    }

    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      quantityRequired: '',
      unit: 'kg',
      qualityRequirements: '',
      deliveryDate: '',
      deliveryLocation: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  return (
    <div className="card buyer-card">
      <h2>Post Your Product Requirement</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Requirement Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Fresh Organic Tomatoes"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your requirements in detail..."
            rows="4"
            className="w-full p-2 border rounded"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a category</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="grains">Grains</option>
            <option value="dairy">Dairy</option>
            <option value="poultry">Poultry</option>
            <option value="fish">Fish</option>
            <option value="spices">Spices</option>
            <option value="flowers">Flowers</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="quantityRequired">Quantity Required *</label>
            <input
              type="number"
              id="quantityRequired"
              name="quantityRequired"
              value={formData.quantityRequired}
              onChange={handleChange}
              min="1"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit *</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="ton">Tonnes (ton)</option>
              <option value="quintal">Quintals</option>
              <option value="piece">Pieces</option>
              <option value="liter">Liters</option>
              <option value="gram">Grams</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="qualityRequirements">Quality Requirements</label>
          <input
            type="text"
            id="qualityRequirements"
            name="qualityRequirements"
            value={formData.qualityRequirements}
            onChange={handleChange}
            placeholder="e.g., Organic, Grade A, Fresh harvest"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="deliveryDate">Preferred Delivery Date *</label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="form-group">
            <label htmlFor="deliveryLocation">Delivery Location *</label>
            <input
              type="text"
              id="deliveryLocation"
              name="deliveryLocation"
              value={formData.deliveryLocation}
              onChange={handleChange}
              placeholder="City, State"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="minPrice">Minimum Budget (₹)</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={formData.minPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxPrice">Maximum Budget (₹) *</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={formData.maxPrice}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="Enter max amount"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button type="submit" className="btn-action btn-post w-full mt-4">
          Post Requirement
        </button>
      </form>
    </div>
  );
};

export default PostRequirementForm;
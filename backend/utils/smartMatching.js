/**
 * Advanced Smart Matching Algorithm for Agricultural Marketplace
 * Matches buyers with farmers based on distance, price, rating, and availability
 */

class SmartMatching {
  /**
   * Calculate compatibility score with advanced factors
   * @param {Object} productListing - The buyer's product requirement
   * @param {Object} farmer - The farmer's profile
   * @param {Object} bid - The farmer's bid (optional)
   * @returns {number} Compatibility score (0-100)
   */
  static calculateCompatibilityScore(productListing, farmer, bid = null) {
    let score = 0;
    let maxScore = 100;

    // 1. Location Distance (weight: 30%)
    const distanceScore = this.calculateDistanceScore(productListing.deliveryLocation, farmer.location);
    score += distanceScore * 30;

    // 2. Price Competitiveness (weight: 25%)
    if (bid) {
      const priceScore = this.calculatePriceScore(productListing.budget.maxPrice, bid.unitPrice);
      score += priceScore * 25;
    } else {
      // If no bid, use average market price estimation
      score += 20; // Default score for price when no bid
    }

    // 3. Farmer Rating (weight: 20%)
    const ratingScore = this.calculateRatingScore(farmer.ratings);
    score += ratingScore * 20;

    // 4. Availability & Capacity (weight: 15%)
    const availabilityScore = this.calculateAvailabilityScore(farmer, productListing.quantityRequired);
    score += availabilityScore * 15;

    // 5. Crop Specialization Match (weight: 10%)
    const specializationScore = this.calculateSpecializationScore(productListing.category, farmer.farmDetails?.cropsGrown);
    score += specializationScore * 10;

    return Math.round(score);
  }

  /**
   * Calculate distance-based score
   * @private
   */
  static calculateDistanceScore(buyerLocation, farmerLocation) {
    // In a real implementation, use geocoding API to get coordinates
    // For demo, we'll use a simple string matching approach
    
    // Same city/state = 100%
    if (buyerLocation.toLowerCase().includes(farmerLocation.toLowerCase()) || 
        farmerLocation.toLowerCase().includes(buyerLocation.toLowerCase())) {
      return 1.0;
    }
    
    // Same state = 80%
    const buyerState = buyerLocation.split(',').pop().trim().toLowerCase();
    const farmerState = farmerLocation.split(',').pop().trim().toLowerCase();
    if (buyerState === farmerState) {
      return 0.8;
    }
    
    // Different regions = 40%
    return 0.4;
  }

  /**
   * Calculate price competitiveness score
   * @private
   */
  static calculatePriceScore(maxBudget, unitPrice) {
    if (unitPrice <= maxBudget * 0.7) return 1.0; // Excellent price
    if (unitPrice <= maxBudget * 0.85) return 0.8; // Good price
    if (unitPrice <= maxBudget) return 0.6; // Fair price
    if (unitPrice <= maxBudget * 1.15) return 0.3; // Slightly high
    return 0.1; // Too expensive
  }

  /**
   * Calculate rating score
   * @private
   */
  static calculateRatingScore(ratings) {
    if (!ratings || ratings.count === 0) return 0.5; // New farmers get medium score
    
    const avgRating = ratings.average;
    if (avgRating >= 4.5) return 1.0;
    if (avgRating >= 4.0) return 0.8;
    if (avgRating >= 3.5) return 0.6;
    if (avgRating >= 3.0) return 0.4;
    return 0.2;
  }

  /**
   * Calculate availability score
   * @private
   */
  static calculateAvailabilityScore(farmer, requiredQuantity) {
    // This would check farmer's current commitments vs capacity
    // For demo, we'll assume availability based on farm size
    const farmSize = farmer.farmDetails?.farmSize || '10 acres';
    const sizeMatch = farmSize.match(/(\d+(?:\.\d+)?)\s*(hectares|acres|sq\.?\s*km|sq\.?\s*m)/i);
    
    if (sizeMatch) {
      const size = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2].toLowerCase();
      let capacity = 0;
      
      if (unit.includes('hectare')) capacity = size * 2000; // kg per hectare
      else if (unit.includes('acre')) capacity = size * 800; // kg per acre
      else capacity = size * 1000; // default estimate
      
      // Higher score if capacity can meet demand
      if (capacity >= requiredQuantity * 2) return 1.0; // More than enough
      if (capacity >= requiredQuantity * 1.5) return 0.8; // Good capacity
      if (capacity >= requiredQuantity) return 0.6; // Just enough
      if (capacity >= requiredQuantity * 0.7) return 0.4; // Slightly short
      return 0.2; // Not enough
    }
    
    return 0.5; // Unknown capacity
  }

  /**
   * Calculate specialization match score
   * @private
   */
  static calculateSpecializationScore(category, cropsGrown) {
    if (!cropsGrown || cropsGrown.length === 0) return 0.3; // Generic farmer
    
    const categoryLower = category.toLowerCase();
    const matchFound = cropsGrown.some(crop => 
      categoryLower.includes(crop.toLowerCase()) || 
      crop.toLowerCase().includes(categoryLower)
    );
    
    return matchFound ? 1.0 : 0.2; // Specialized vs non-specialized
  }

  /**
   * Find best matches for a product listing
   * @param {Object} productListing - The buyer's product requirement
   * @param {Array} farmers - Available farmers
   * @param {Array} bids - Available bids (optional)
   * @returns {Array} Sorted array of farmers with scores (top 3)
   */
  static findBestMatches(productListing, farmers, bids = []) {
    const matchesWithScores = farmers.map(farmer => {
      // Find if this farmer has a bid for this listing
      const farmerBid = bids.find(bid => bid.farmerId.toString() === farmer._id.toString());
      
      return {
        farmer,
        bid: farmerBid,
        score: this.calculateCompatibilityScore(productListing, farmer, farmerBid),
        ranking: 0
      };
    });

    // Sort by score (descending)
    matchesWithScores.sort((a, b) => b.score - a.score);

    // Assign rankings and return top 3
    const topMatches = matchesWithScores.slice(0, 3);
    topMatches.forEach((match, index) => {
      match.ranking = index + 1;
    });

    return topMatches;
  }

  /**
   * Find suitable product listings for a farmer
   * @param {Object} farmer - Farmer's profile
   * @param {Array} productListings - Available buyer requirements
   * @returns {Array} Sorted array of product listings with scores (top 5)
   */
  static findSuitableListings(farmer, productListings) {
    const matchesWithScores = productListings.map(listing => ({
      listing,
      score: this.calculateCompatibilityScore(listing, farmer),
      ranking: 0
    }));

    // Sort by score (descending)
    matchesWithScores.sort((a, b) => b.score - a.score);

    // Assign rankings and return top 5
    const topMatches = matchesWithScores.slice(0, 5);
    topMatches.forEach((match, index) => {
      match.ranking = index + 1;
    });

    return topMatches;
  }

  /**
   * Get personalized recommendations for farmers
   * @param {Object} farmer - Farmer's profile
   * @param {Array} productListings - Available product listings
   * @returns {Array} Top 5 recommendations with scores
   */
  static getFarmerRecommendations(farmer, productListings) {
    const recommendations = productListings
      .filter(listing => {
        // Filter listings that match farmer's crop preferences
        if (farmer.farmDetails && farmer.farmDetails.cropsGrown) {
          return farmer.farmDetails.cropsGrown.some(crop => 
            listing.category.toLowerCase().includes(crop.toLowerCase())
          );
        }
        return true;
      })
      .map(listing => ({
        listing,
        score: this.calculateCompatibilityScore(listing, farmer),
        ranking: 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    recommendations.forEach((rec, index) => {
      rec.ranking = index + 1;
    });

    return recommendations;
  }

}

module.exports = SmartMatching;
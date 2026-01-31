const Joi = require('joi');

// Validation middleware factory
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    next();
  };
};

// User registration validation schema
exports.registerSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  phone: Joi.string().required(),
  role: Joi.string().valid('customer', 'vendor', 'driver').default('customer'),
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    zipCode: Joi.string(),
    coordinates: Joi.object({
      lat: Joi.number(),
      lng: Joi.number()
    })
  })
});

// User login validation schema
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Vendor creation validation schema
exports.vendorSchema = Joi.object({
  restaurantName: Joi.string().required().trim(),
  description: Joi.string().required(),
  cuisine: Joi.array().items(Joi.string()).min(1).required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string(),
    zipCode: Joi.string(),
    coordinates: Joi.object({
      lat: Joi.number(),
      lng: Joi.number()
    })
  }).required(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  openingHours: Joi.object(),
  logo: Joi.string(),
  banner: Joi.string(),
  minimumOrder: Joi.number().min(0),
  deliveryFee: Joi.number().min(0),
  deliveryTime: Joi.string()
});

// Product validation schema
exports.productSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().required(),
  price: Joi.number().required().min(0),
  category: Joi.string().required(),
  image: Joi.string(),
  isAvailable: Joi.boolean(),
  isVegetarian: Joi.boolean(),
  isVegan: Joi.boolean(),
  spiceLevel: Joi.string().valid('none', 'mild', 'medium', 'hot', 'extra-hot'),
  preparationTime: Joi.number().min(0),
  ingredients: Joi.array().items(Joi.string()),
  allergens: Joi.array().items(Joi.string()),
  nutritionInfo: Joi.object({
    calories: Joi.number(),
    protein: Joi.number(),
    carbs: Joi.number(),
    fat: Joi.number()
  })
});

// Order validation schema
exports.orderSchema = Joi.object({
  vendor: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      product: Joi.string().required(),
      quantity: Joi.number().required().min(1),
      specialInstructions: Joi.string()
    })
  ).min(1).required(),
  deliveryAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string(),
    zipCode: Joi.string(),
    coordinates: Joi.object({
      lat: Joi.number(),
      lng: Joi.number()
    })
  }).required(),
  paymentMethod: Joi.string().valid('cash', 'card', 'wallet').required(),
  specialInstructions: Joi.string()
});

// Review validation schema
exports.reviewSchema = Joi.object({
  order: Joi.string().required(),
  foodRating: Joi.number().required().min(1).max(5),
  deliveryRating: Joi.number().min(1).max(5),
  comment: Joi.string().max(500),
  images: Joi.array().items(Joi.string())
});

// Driver validation schema
exports.driverSchema = Joi.object({
  vehicleType: Joi.string().valid('bike', 'scooter', 'car', 'bicycle').required(),
  vehicleNumber: Joi.string().required(),
  licenseNumber: Joi.string().required(),
  documents: Joi.object({
    license: Joi.string(),
    vehicleRegistration: Joi.string(),
    insurance: Joi.string()
  })
});

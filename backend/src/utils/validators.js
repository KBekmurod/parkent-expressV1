const Joi = require('joi');

/**
 * User (Customer) validation schemas
 */
const userSchemas = {
  register: Joi.object({
    telegramId: Joi.string().required(),
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().allow(''),
    phone: Joi.string().trim().required()
  }),
  
  addAddress: Joi.object({
    title: Joi.string().trim().required(),
    location: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required(),
    address: Joi.string().trim().required(),
    isDefault: Joi.boolean().default(false)
  })
};

/**
 * Vendor validation schemas
 */
const vendorSchemas = {
  register: Joi.object({
    telegramId: Joi.string().required(),
    name: Joi.string().trim().required(),
    description: Joi.string().trim().allow(''),
    category: Joi.string().trim().required(),
    phone: Joi.string().trim().required(),
    location: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required(),
    address: Joi.string().trim().required(),
    workingHours: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
    }).required()
  }),
  
  update: Joi.object({
    name: Joi.string().trim(),
    description: Joi.string().trim(),
    category: Joi.string().trim(),
    phone: Joi.string().trim(),
    workingHours: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    }),
    isOpen: Joi.boolean()
  })
};

/**
 * Driver validation schemas
 */
const driverSchemas = {
  register: Joi.object({
    telegramId: Joi.string().required(),
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().allow(''),
    phone: Joi.string().trim().required(),
    vehicle: Joi.string().valid('bicycle', 'motorcycle', 'car').required()
  }),
  
  updateLocation: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  })
};

/**
 * Product validation schemas
 */
const productSchemas = {
  create: Joi.object({
    vendor: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    name: Joi.object({
      uz: Joi.string().trim().required(),
      ru: Joi.string().trim().allow('')
    }).required(),
    description: Joi.object({
      uz: Joi.string().trim().allow(''),
      ru: Joi.string().trim().allow('')
    }),
    price: Joi.number().min(0).required(),
    category: Joi.string().trim().required(),
    preparationTime: Joi.number().min(1).default(30),
    discount: Joi.number().min(0).max(100).default(0)
  }),
  
  update: Joi.object({
    name: Joi.object({
      uz: Joi.string().trim(),
      ru: Joi.string().trim()
    }),
    description: Joi.object({
      uz: Joi.string().trim(),
      ru: Joi.string().trim()
    }),
    price: Joi.number().min(0),
    category: Joi.string().trim(),
    preparationTime: Joi.number().min(1),
    discount: Joi.number().min(0).max(100),
    isAvailable: Joi.boolean()
  })
};

/**
 * Order validation schemas
 */
const orderSchemas = {
  create: Joi.object({
    customer: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    vendor: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    items: Joi.array().items(
      Joi.object({
        product: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        quantity: Joi.number().min(1).required()
      })
    ).min(1).required(),
    deliveryAddress: Joi.object({
      location: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),
      address: Joi.string().trim().required()
    }).required(),
    paymentMethod: Joi.string().valid('cash', 'card').required(),
    customerNote: Joi.string().trim().allow('')
  }),
  
  updateStatus: Joi.object({
    status: Joi.string().valid(
      'pending', 'accepted', 'preparing', 'ready', 
      'assigned', 'picked_up', 'on_the_way', 
      'delivered', 'cancelled', 'rejected'
    ).required(),
    note: Joi.string().trim().allow('')
  })
};

/**
 * Review validation schemas
 */
const reviewSchemas = {
  create: Joi.object({
    order: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    customer: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    vendor: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    driver: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    foodRating: Joi.number().min(1).max(5).required(),
    deliveryRating: Joi.number().min(1).max(5),
    comment: Joi.string().max(500).trim()
  })
};

/**
 * Category validation schemas
 */
const categorySchemas = {
  create: Joi.object({
    name: Joi.object({
      uz: Joi.string().required().trim(),
      ru: Joi.string().required().trim()
    }).required(),
    icon: Joi.string().trim(),
    order: Joi.number().integer().min(0)
  }),
  update: Joi.object({
    name: Joi.object({
      uz: Joi.string().trim(),
      ru: Joi.string().trim()
    }),
    icon: Joi.string().trim(),
    order: Joi.number().integer().min(0),
    isActive: Joi.boolean()
  })
};

/**
 * Admin validation schemas
 */
const adminSchemas = {
  login: Joi.object({
    username: Joi.string().trim().required(),
    password: Joi.string().required()
  }),
  
  register: Joi.object({
    username: Joi.string().trim().lowercase().required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().allow(''),
    role: Joi.string().valid('super_admin', 'operator', 'accountant').default('operator')
  })
};

module.exports = {
  userSchemas,
  vendorSchemas,
  driverSchemas,
  productSchemas,
  orderSchemas,
  reviewSchemas,
  adminSchemas,
  categorySchemas
};

#!/bin/bash

echo "======================================"
echo "Parkent Express Backend Verification"
echo "======================================"
echo ""

echo "Checking project structure..."
echo ""

echo "✓ Checking models..."
test -f "models/User.js" && echo "  ✓ User model exists"
test -f "models/Vendor.js" && echo "  ✓ Vendor model exists"
test -f "models/Driver.js" && echo "  ✓ Driver model exists"
test -f "models/Product.js" && echo "  ✓ Product model exists"
test -f "models/Order.js" && echo "  ✓ Order model exists"
test -f "models/Review.js" && echo "  ✓ Review model exists"
test -f "models/Transaction.js" && echo "  ✓ Transaction model exists"
echo ""

echo "✓ Checking controllers..."
test -f "controllers/authController.js" && echo "  ✓ Auth controller exists"
test -f "controllers/userController.js" && echo "  ✓ User controller exists"
test -f "controllers/vendorController.js" && echo "  ✓ Vendor controller exists"
test -f "controllers/driverController.js" && echo "  ✓ Driver controller exists"
test -f "controllers/productController.js" && echo "  ✓ Product controller exists"
test -f "controllers/orderController.js" && echo "  ✓ Order controller exists"
test -f "controllers/reviewController.js" && echo "  ✓ Review controller exists"
test -f "controllers/transactionController.js" && echo "  ✓ Transaction controller exists"
echo ""

echo "✓ Checking routes..."
test -f "routes/auth.js" && echo "  ✓ Auth routes exist"
test -f "routes/users.js" && echo "  ✓ User routes exist"
test -f "routes/vendors.js" && echo "  ✓ Vendor routes exist"
test -f "routes/drivers.js" && echo "  ✓ Driver routes exist"
test -f "routes/products.js" && echo "  ✓ Product routes exist"
test -f "routes/orders.js" && echo "  ✓ Order routes exist"
test -f "routes/reviews.js" && echo "  ✓ Review routes exist"
test -f "routes/transactions.js" && echo "  ✓ Transaction routes exist"
echo ""

echo "✓ Checking middlewares..."
test -f "middlewares/auth.js" && echo "  ✓ Auth middleware exists"
test -f "middlewares/validator.js" && echo "  ✓ Validator middleware exists"
test -f "middlewares/error.js" && echo "  ✓ Error handler middleware exists"
echo ""

echo "✓ Checking configuration..."
test -f "config/db.js" && echo "  ✓ Database config exists"
test -f ".env.example" && echo "  ✓ .env.example exists"
test -f ".gitignore" && echo "  ✓ .gitignore exists"
test -f "package.json" && echo "  ✓ package.json exists"
echo ""

echo "✓ Checking utilities..."
test -f "utils/jwt.js" && echo "  ✓ JWT utilities exist"
echo ""

echo "✓ Checking main files..."
test -f "server.js" && echo "  ✓ Server.js exists"
test -f "README.md" && echo "  ✓ README.md exists"
test -f "API_TESTING.md" && echo "  ✓ API_TESTING.md exists"
echo ""

echo "Checking dependencies..."
if command -v node &> /dev/null; then
    echo "  ✓ Node.js is installed: $(node --version)"
else
    echo "  ✗ Node.js is not installed"
fi

if [ -d "node_modules" ]; then
    echo "  ✓ node_modules directory exists"
    
    # Check critical dependencies
    test -d "node_modules/express" && echo "  ✓ Express is installed"
    test -d "node_modules/mongoose" && echo "  ✓ Mongoose is installed"
    test -d "node_modules/jsonwebtoken" && echo "  ✓ JWT is installed"
    test -d "node_modules/bcryptjs" && echo "  ✓ Bcrypt is installed"
    test -d "node_modules/joi" && echo "  ✓ Joi is installed"
    test -d "node_modules/dotenv" && echo "  ✓ Dotenv is installed"
    test -d "node_modules/cors" && echo "  ✓ CORS is installed"
else
    echo "  ✗ node_modules directory not found. Run 'npm install'"
fi
echo ""

echo "======================================"
echo "Backend Structure Verification Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Ensure MongoDB is running"
echo "2. Copy .env.example to .env and configure"
echo "3. Run 'npm start' to start the server"
echo "4. Test endpoints using API_TESTING.md guide"
echo ""

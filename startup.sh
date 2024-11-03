# The startup.sh script should run any preparation needed 
#for your code to run in a new environment. It should create install 
#all required packages via npm, run all migrations, and check that the required 
#compilers/interpreters are already installed. ** Also, this script must also create 
#an admin user, with the username and password being included in the docs **.

#!/bin/bash

#!/bin/bash

# Startup script for Next.js backend in Ubuntu 22.04

echo "Starting setup for Next.js backend..."

# Check for Node.js 20+
echo "Checking Node.js version..."
NODE_VERSION=$(node -v)
REQUIRED_NODE_VERSION="v20"

if [[ $NODE_VERSION != $REQUIRED_NODE_VERSION* ]]; then
    echo "Error: Node.js 20+ is required. Current version: $NODE_VERSION"
    exit 1
fi
echo "Node.js version is $NODE_VERSION"

# 1. Install npm packages
echo "Installing npm packages..."
npm install
if [[ $? -ne 0 ]]; then
    echo "Error: npm install failed."
    exit 1
fi

# 2. Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy
if [[ $? -ne 0 ]]; then
    echo "Error: Prisma migrations failed."
    exit 1
fi

# 3. Seed the database with an admin user directly
echo "Creating admin user..."

# Use node command to directly execute JavaScript that interacts with Prisma to create an admin user.
node -e "
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const prisma = new PrismaClient();

    async function createAdmin() {
        const hashedPassword = await bcrypt.hash('adminpassword', 10);  // Replace 'adminpassword' with secure password if needed
        await prisma.user.upsert({
            where: { email: 'admin@example.com' }, // Change as needed
            update: {},
            create: {
                email: 'admin@example.com',  // Admin email
                password: hashedPassword,  // Admin password (hashed)
                userName: 'admin',  // Admin username
                role: 'ADMIN',  // Admin role
            },
        });
        console.log('Admin user created');
    }

    createAdmin()
      .catch((e) => {
        console.error(e);
        process.exit(1);
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
"
if [[ $? -ne 0 ]]; then
    echo "Error: Admin user creation failed."
    exit 1
fi

# 4. Check for required compilers/interpreters (gcc, g++, Python, Java)
echo "Checking for required compilers/interpreters..."

# Check if GCC is installed
if ! command -v gcc &> /dev/null; then
    echo "Error: GCC (C compiler) could not be found. Please install GCC."
    exit 1
fi
echo "GCC found."

# Check if G++ is installed
if ! command -v g++ &> /dev/null; then
    echo "Error: G++ (C++ compiler) could not be found. Please install G++."
    exit 1
fi
echo "G++ found."

# Check if Python 3.10+ is installed
PYTHON_VERSION=$(python3 --version 2>&1)
REQUIRED_PYTHON_VERSION="3.10"
if [[ $PYTHON_VERSION != *$REQUIRED_PYTHON_VERSION* ]]; then
    echo "Error: Python 3.10+ is required. Current version: $PYTHON_VERSION"
    exit 1
fi
echo "Python version is $PYTHON_VERSION"

# Check if Java 20+ is installed
JAVA_VERSION=$(java -version 2>&1 | head -n 1)
REQUIRED_JAVA_VERSION="20"
if [[ $JAVA_VERSION != *$REQUIRED_JAVA_VERSION* ]]; then
    echo "Error: Java 20+ is required. Current version: $JAVA_VERSION"
    exit 1
fi
echo "Java version is $JAVA_VERSION"

echo "Setup complete. You can now run the server using run.sh."

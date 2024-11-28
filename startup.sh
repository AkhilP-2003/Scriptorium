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
REQUIRED_NODE_VERSION="20"

# Get the current installed Node.js version
NODE_VERSION=$(node -v | sed 's/v//')

# Compare versions
if [ "$(echo -e "$REQUIRED_NODE_VERSION\n$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE_VERSION" ]; then
    echo "Error: Node.js $REQUIRED_NODE_VERSION+ is required. Current version: $NODE_VERSION"
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

NODE_SCRIPT=$(cat << 'EOF'
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcrypt');
    const prisma = new PrismaClient();

    async function createAdminUser() {
        try {
            const adminEmail = 'admin@example.com';
            const adminPass = 'admin123';
            if (!adminPass) throw new Error('Admin password not provided');
        
            const hashedPassword = await bcrypt.hash(adminPass, 10);  // Replace 'adminpassword' with a secure password
            await prisma.user.upsert({
                where: { email: adminEmail },  // Admin email
                update: {
                    password: hashedPassword,
                },
                create: {
                    email: adminEmail,  // Admin email
                    password: hashedPassword,  // Hashed password
                    userName: 'admin',  // Admin username
                    role: 'ADMIN',  // Admin role
                    firstName: 'adminfirst',
                    lastName: 'adminlast',
                    phoneNumber: '1112111413',
                    avatar: 'www.icon.com'
                },
            });
            console.log('Admin user created successfully');
            console.log('admin email:', adminEmail);
            console.log('admin password:', adminPass);


        } catch (error) {
            console.error('Error creating admin user:', error);
            process.exit(1);  // Exit with error code
        } finally {
            await prisma.$disconnect();
        }
    }

    createAdminUser();
EOF
)

# Execute the script stored in the NODE_SCRIPT variable
if ! node -e "$NODE_SCRIPT"; then
    echo "Error: Failed to create admin user."
    exit 1
fi

# 4. Check for required compilers/interpreters (gcc, g++, Python, Java)
echo "Building docker images, this may take a while...."

#Call build all to build all the docker images
chmod +x ./utils/dockerfiles/build-all.sh
. ./utils/dockerfiles/build-all.sh

echo "Setup complete. You can now run the server using run.sh."

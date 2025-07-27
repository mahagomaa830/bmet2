// create-admin.js
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import { users } from './server/db/schema.js';

// Database connection
const connectionString = 'postgresql://postgres:123456@localhost:5432/bmet';
const sql = postgres(connectionString);
const db = drizzle(sql);

async function createAdminUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const adminUser = await db.insert(users).values({
      name: 'System Administrator',
      email: 'admin@bmet.com',
      phone: '01000000000',
      password: hashedPassword,
      role: 'admin',
      department: 'IT',
      isActive: true
    }).returning();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@bmet.com');
    console.log('🔐 Password: admin123');
    console.log('👤 User ID:', adminUser[0].id);
    
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      console.log('❌ Admin user already exists!');
      console.log('📧 Try logging in with: admin@bmet.com');
      console.log('🔐 Password: admin123');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  } finally {
    await sql.end();
  }
}

createAdminUser();
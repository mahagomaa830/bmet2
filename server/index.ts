import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { googleDriveService } from "./google-drive";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Reset and create default users
async function resetAndCreateUsers() {
  try {
    const { db } = await import("./db");
    const { users } = await import("../shared/schema");
    const bcrypt = await import("bcrypt");

    console.log('🔄 Resetting users table...');
    
    // Delete all existing users
    await db.delete(users);
    console.log('✅ All users deleted');

    // Create the 3 default users
    const defaultUsers = [
      {
        name: 'System Administrator',
        email: 'admin@bmet.com',
        phone: '01000000001',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        department: 'IT'
      },
      {
        name: 'Senior Technician',
        email: 'technician@bmet.com',
        phone: '01000000002',
        password: await bcrypt.hash('tech123', 10),
        role: 'technician',
        department: 'Biomedical Engineering'
      },
      {
        name: 'Head Nurse',
        email: 'nurse@bmet.com',
        phone: '01000000003',
        password: await bcrypt.hash('nurse123', 10),
        role: 'nurse',
        department: 'Nursing'
      }
    ];

    console.log('➕ Creating default users...');
    
    for (const user of defaultUsers) {
      const newUser = await db.insert(users).values({
        ...user,
        isActive: true
      }).returning();
      
      console.log(`✅ Created ${user.role}: ${user.email} (ID: ${newUser[0].id})`);
    }

    console.log('\n🎉 All users created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('👑 ADMIN:');
    console.log('   Email: admin@bmet.com');
    console.log('   Password: admin123');
    console.log('\n🔧 TECHNICIAN:');
    console.log('   Email: technician@bmet.com');
    console.log('   Password: tech123');
    console.log('\n👩‍⚕️ NURSE:');
    console.log('   Email: nurse@bmet.com');
    console.log('   Password: nurse123');
    console.log('\n' + '='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
  }
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Get port from environment variable or use 5001 as default
  const PORT = process.env.PORT || 5001;
  
  server.listen(PORT, 'localhost', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Reset and create users on startup
    resetAndCreateUsers();
    
    // Start Google Drive auto backup service
    try {
      googleDriveService.startAutoBackup();
      log("Google Drive auto backup service started");
    } catch (error) {
      log("Google Drive service not available - check GOOGLE_SERVICE_ACCOUNT_KEY");
    }
  });
})();
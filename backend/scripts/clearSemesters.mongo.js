// MongoDB Shell Commands to Clear Semesters
// Run these in MongoDB Compass or mongosh

// Option 1: Delete all semesters (recommended - keeps collection structure)
db.semesters.deleteMany({});

// Option 2: Drop the entire collection (if you want to completely reset)
// db.semesters.drop();

// Verify deletion
db.semesters.countDocuments();  // Should return 0

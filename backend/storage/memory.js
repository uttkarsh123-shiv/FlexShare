// In-memory storage for development testing
const files = new Map();

const memoryStorage = {
  create: (data) => {
    const id = data.code;
    const fileData = { 
      ...data, 
      createdAt: new Date(), 
      updatedAt: new Date(),
      _id: id,
      accessLogs: data.accessLogs || [],
      firstViewShown: data.firstViewShown || false
    };
    files.set(id, fileData);
    return Promise.resolve(fileData);
  },
  
  findOne: (query) => {
    const code = query.code;
    const file = files.get(code);
    if (file) {
      // Check if expired
      if (new Date() > new Date(file.expiry)) {
        files.delete(code);
        return Promise.resolve(null);
      }
      
      // Create a mock mongoose document with save method
      const mockDoc = {
        ...file,
        save: function() {
          files.set(code, this);
          return Promise.resolve(this);
        }
      };
      
      return Promise.resolve(mockDoc);
    }
    return Promise.resolve(null);
  },
  
  updateOne: (query, update) => {
    const code = query.code;
    const file = files.get(code);
    if (file) {
      Object.assign(file, update, { updatedAt: new Date() });
      files.set(code, file);
      return Promise.resolve({ modifiedCount: 1 });
    }
    return Promise.resolve({ modifiedCount: 0 });
  },
  
  deleteOne: (query) => {
    const code = query.code;
    const deleted = files.delete(code);
    return Promise.resolve({ deletedCount: deleted ? 1 : 0 });
  }
};

module.exports = memoryStorage;
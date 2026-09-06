const files = new Map();

const memoryStorage = {
  create: (data) => {
    const id = data.code;
    const fileData = { 
      ...data, 
      createdAt: new Date(), 
      updatedAt: new Date(),
      _id: id,
      accessLogs: data.accessLogs || []
    };
    files.set(id, fileData);
    return Promise.resolve(fileData);
  },
  
  findOne: (query) => {
    const code = query.code;
    const file = files.get(code);

    let result = null;
    if (file) {
      if (new Date() > new Date(file.expiry)) {
        files.delete(code);
      } else {
        result = {
          ...file,
          save: function() {
            files.set(code, this);
            return Promise.resolve(this);
          }
        };
      }
    }

    // Return a thenable that also supports .select() and .lean() chaining
    const chainable = {
      select: () => chainable,
      lean:   () => chainable,
      then:   (resolve, reject) => Promise.resolve(result).then(resolve, reject),
      catch:  (reject) => Promise.resolve(result).catch(reject),
    };

    return chainable;
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
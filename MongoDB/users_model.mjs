// Get the mongoose object
import mongoose from 'mongoose';

// Prepare to the database users_db in the MongoDB server running locally on port 27017
mongoose.connect(
    "mongodb://localhost:27017/users_db",
    { useNewUrlParser: true, useUnifiedTopology: true }
);

// Connect to to the database
const db = mongoose.connection;
// The open event is called when the database connection successfully opens
db.once("open", () => {
    console.log("Successfully connected to MongoDB using Mongoose!");
});

// Tell mongoose to create indexes, which help with faster querying
mongoose.set("useCreateIndex", true);

/**
 * Define the schema
 */
const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    strategies: { type: String, required: false }
});

/**
 * Compile the model from the schema. This must be done after defining the schema.
 */
const User = mongoose.model("User", userSchema);

/**
 * Create a user
 * @param {String} username 
 * @param {String} password 
 * @param {String} strategies
 * @returns A promise. Resolves to the JSON object for the document created by calling save
 */
const createUser = async (username, password, strategies) => {
    // Call the constructor to create an instance of the model class User
    const user = new User({ username: username, password: password, strategies: strategies });
    // Call save to persist this object as a document in MongoDB
    return user.save();
}

/**
 * Retrive users based on the filter, projection and limit parameters
 * @param {Object} filter 
 * @param {String} projection 
 * @param {Number} limit 
 * @returns 
 */
const findUsers = async (filter, projection, limit) => {
    const query = User.find(filter)
        .select(projection)
        .limit(limit);
    return query.exec();
}

/**
 * Find the user with the given ID value
 * @param {String} _id 
 * @returns 
 */
const findUserById = async (_id) => {
    const query = User.findById(_id);
    return query.exec();
}

/**
 * Replace the username, password, strategies properties of the user with the id value provided
 * @param {String} _id 
 * @param {String} username 
 * @param {String} password 
 * @param {String} strategies
 * @returns A promise. Resolves to the number of documents modified
 */
const replaceUser = async (_id, username, password, strategies) => {
    const result = await User.replaceOne({ _id: _id }, { username: username, password: password, strategies: strategies });
    return result.nModified;
}


/**
 * Delete the user with provided id value
 * @param {String} _id 
 * @returns A promise. Resolves to the count of deleted documents
 */
const deleteById = async (_id) => {
    const result = await User.deleteOne({ _id: _id });
    // Return the count of deleted document. Since we called deleteOne, this will be either 0 or 1.
    return result.deletedCount;
}

export { deleteById, replaceUser, findUserById, createUser, findUsers };
// Importing required module
const MongoClient = require("mongodb").MongoClient;

// Database and collection configuration
const dbName = "custdb";
const baseUrl = "mongodb://127.0.0.1:27017";
const collectionName = "customers";
const connectString = baseUrl + "/" + dbName;
let collection;

// Function to initialize database connection
async function dbStartup() {
  const client = new MongoClient(connectString);
  await client.connect();
  collection = client.db(dbName).collection(collectionName);
}

// Function to fetch all customers
async function getCustomers() {
  try {
    const customers = await collection.find().toArray();
    // throw { message: "an error occured" };
    return [customers, null];
  } catch (err) {
    console.log(err.message);
    return [null, err.message];
  }
}

// Function to add a new customer
async function addCustomer(newCustomer) {
  try {
    const insertResult = await collection.insertOne(newCustomer);
    // return array [status, id, errMessage]
    return ["success", insertResult.insertedId, null];
  } catch (err) {
    console.log(err.message);
    return ["fail", null, err.message];
  }
}

// Function to reset customer data
async function resetCustomers() {
  let data = [
    { id: 0, name: "Mary Jackson", email: "maryj@abc.com", password: "maryj" },
    {
      id: 1,
      name: "Karen Addams",
      email: "karena@abc.com",
      password: "karena",
    },
    {
      id: 2,
      name: "Scott Ramsey",
      email: "scottr@abc.com",
      password: "scottr",
    },
  ];

  // Deletes the recreates standard data above
  try {
    await collection.deleteMany({});
    await collection.insertMany(data);
    const customers = await collection.find().toArray();
    const message =
      "data was refreshed. There are now " +
      customers.length +
      " customer records!";
    return [message, null];
  } catch (err) {
    console.log(err.message);
    return [null, err.message];
  }
}

// Function to fetch a customer by ID
async function getCustomerById(id) {
  try {
    const customer = await collection.findOne({ id: +id });
    // return array [customer, errMessage]
    if (!customer) {
      return [null, "invalid customer number"];
    }
    return [customer, null];
  } catch (err) {
    console.log(err.message);
    return [null, err.message];
  }
}

// Function to update a customer
async function updateCustomer(updatedCustomer) {
  try {
    const filter = { id: updatedCustomer.id };
    const setData = { $set: updatedCustomer };
    const updateResult = await collection.updateOne(filter, setData);
    // return array [message, errMessage]
    return ["one record updated", null];
  } catch (err) {
    console.log(err.message);
    return [null, err.message];
  }
}

// Function to delete a customer by ID
async function deleteCustomerById(id) {
  try {
    const deleteResult = await collection.deleteOne({ id: +id });
    if (deleteResult.deletedCount === 0) {
      // return array [message, errMessage]
      return [null, "no record deleted"];
    } else if (deleteResult.deletedCount === 1) {
      return ["one record deleted", null];
    } else {
      return [null, "error deleting records"];
    }
  } catch (err) {
    console.log(err.message);
    return [null, err.message];
  }
}

// Starts the DB connection
dbStartup();

// Exports functions
module.exports = {
  getCustomerById,
  getCustomers,
  resetCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomerById,
};

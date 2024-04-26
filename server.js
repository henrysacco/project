const express = require("express");
const bodyParser = require("body-parser");
const da = require("./data-access");
const path = require("path");
const checkApiKey = require("./security").checkApiKey;
const getNewApiKey = require("./security").getNewApiKey;
const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());

// Set the static directory to serve files from
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get("/apikey", async (req, res) => {
  let email = req.query.email;
  if (email) {
    const newApiKey = getNewApiKey(email);
    res.send(newApiKey);
  } else {
    res.status(400);
    res.send("an email query param is required");
  }
});

app.get("/customers", checkApiKey, async (req, res) => {
  const [cust, err] = await da.getCustomers();
  if (cust) {
    res.send(cust);
  } else {
    res.status(500);
    res.send(err);
  }
});

app.get("/customers/find/", checkApiKey, async (req, res) => {
  let id = +req.query.id;
  let email = req.query.email;
  let password = req.query.password;
  let query = null;
  if (id > -1) {
    query = { id: id };
  } else if (email) {
    query = { email: email };
  } else if (password) {
    query = { password: password };
  }
  if (query) {
    const [customers, err] = await da.findCustomers(query);
    if (customers) {
      res.send(customers);
    } else {
      res.status(404);
      res.send(err);
    }
  } else {
    res.status(400);
    res.send("query string is required");
  }
});

// Endpoint to retrieve all customers
app.get("/customers", checkApiKey, async (req, res) => {
  const [cust, err] = await da.getCustomers();
  if (cust) {
    res.send(cust);
  } else {
    res.status(500);
    res.send(err);
  }
});

// Endpoint to reset customers to default
app.get("/reset", checkApiKey, async (req, res) => {
  const [result, err] = await da.resetCustomers();
  if (result) {
    res.send(result);
  } else {
    res.status(500);
    res.send(err);
  }
});

// Endpoint to retrieve customers by ID
app.get("/customers/:id", checkApiKey, async (req, res) => {
  const id = req.params.id;
  const [cust, err] = await da.getCustomerById(id);
  if (cust) {
    res.send(cust);
  } else {
    res.status(404);
    res.send(err);
  }
});

// Endpoint to update an existing customer
app.put("/customers/:id", checkApiKey, async (req, res) => {
  const id = req.params.id;
  const updatedCustomer = req.body;
  //if (updatedCustomer === null || req.body != {}) {
  //res.status(400);
  // res.send("missing request body");
  //} else {
  delete updatedCustomer._id;
  const [message, errMessage] = await da.updateCustomer(updatedCustomer);
  if (message) {
    res.send(message);
  } else {
    res.status(400);
    res.send(errMessage);
  }
  //}
});

// Endpoint to add a new customer
app.post("/customers", checkApiKey, async (req, res) => {
  const newCustomer = req.body;
  if (Object.keys(req.body).length === 0) {
    res.status(400).send("missing request body");
  } else {
    if (!newCustomer.name || !newCustomer.email) {
      res.status(400).send("missing required properties");
      return;
    }
    const [status, id, errMessage] = await da.addCustomer(newCustomer);
    if (status === "success") {
      res.status(201).send({ ...newCustomer, _id: id });
    } else {
      res.status(400).send(errMessage);
    }
  }
});

// Endpoint to delete a customer by ID
app.delete("/customers/:id", checkApiKey, async (req, res) => {
  const id = req.params.id;
  const [message, errMessage] = await da.deleteCustomerById(id);
  if (message) {
    res.send(message);
  } else {
    res.status(404);
    res.send(errMessage);
  }
});

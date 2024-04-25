// server.js file
const express = require("express");
const da = require("./data-access");
const path = require("path"); // for handling file paths
const app = express();
const port = process.env.PORT || 4000; // use env var or default to 4000
const bodyParser = require("body-parser");

app.use(bodyParser.json());

// Set the static directory to serve files from
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get("/customers", async (req, res) => {
  const [cust, err] = await da.getCustomers();
  if (cust) {
    res.send(cust);
  } else {
    res.status(500);
    res.send(err);
  }
});

app.get("/reset", async (req, res) => {
  const [result, err] = await da.resetCustomers();
  if (result) {
    res.send(result);
  } else {
    res.status(500);
    res.send(err);
  }
});

app.get("/customers/:id", async (req, res) => {
  const id = req.params.id;
  // return array [customer, errMessage]
  const [cust, err] = await da.getCustomerById(id);
  if (cust) {
    res.send(cust);
  } else {
    res.status(404);
    res.send(err);
  }
});

app.post("/customers", async (req, res) => {
  const newCustomer = req.body;
  // Check if the request body is missing
  if (Object.keys(req.body).length === 0) {
    res.status(400).send("missing request body");
  } else {
    // Check if the required properties are present
    if (!newCustomer.name || !newCustomer.email) {
      res.status(400).send("missing required properties");
      return;
    }
    // Handle the request
    const [status, id, errMessage] = await da.addCustomer(newCustomer);
    if (status === "success") {
      res.status(201).send({ ...newCustomer, _id: id });
    } else {
      res.status(400).send(errMessage);
    }
  }
});

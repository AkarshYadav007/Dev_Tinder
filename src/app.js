const express = require("express");

const app = express();

// Specific routes FIRST
app.use("/test", (req, res) => {
  res.send("Hello from the test page");
});

app.use("/browse", (req, res) => {
  res.send("Hello from the browse page");
});

// Root route LAST
app.use("/", (req, res) => {
  res.send("Hello from the main page");
});

app.listen(3000, () => {
  console.log("server successfully created and running");
});

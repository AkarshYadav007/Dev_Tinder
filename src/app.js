const express = require("express");

const app = express();

// Specific routes FIRST
app.get("/test", (req, res) => {
  res.send("Hello from the test page");
});

app.post("/test", (req, res) => {
  res.send("faster than ligning mcqueen");
});

app.delete("/test", (req, res) => {
  res.send("deleted successfully");
});



app.listen(3000, () => {
  console.log("server successfully created and running");
});

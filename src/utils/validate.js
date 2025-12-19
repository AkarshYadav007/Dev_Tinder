    const validatesignup = ({ FirstName, LastName, Email, Password }) => {
  if (!FirstName || !LastName || !Email || !Password) {
    throw new Error("All fields are required");
  }
};

module.exports = validatesignup;
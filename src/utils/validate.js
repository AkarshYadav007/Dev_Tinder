const validatesignup = (req) => 
    {
        const {FirstName,LastName,Email,Password} = req;

        if(FirstName.length === 0 || LastName.length === 0)
        {
            throw new Error("bhenchod laude lag gye hai");
        }
    }

    module.exports = validatesignup;
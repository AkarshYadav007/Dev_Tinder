const cloudinary = require('cloudinary').v2;
const fs = require('fs');

    // Configuration
    cloudinary.config({ 
        cloud_name: 'dfnb9bzr7', 
        api_key: '535652732356173', 
        api_secret: 'Ac7nH58cmt1-y-tp9EwzQ0_4ndw'
    });

    const uploadOnCloudinary = async(localFilePath) => 
        {
            try
            {
                if(!localFilePath) return null
                
                const response = await cloudinary.uploader.upload(localFilePath, {resource_type:"image"})

                fs.unlinkSync(localFilePath)

                return response;
            }
            catch (err)
            {
                fs.unlinkSync(localFilePath) //removes the locally saved file
                return null;
            }}

module.exports = uploadOnCloudinary;
    
    
    
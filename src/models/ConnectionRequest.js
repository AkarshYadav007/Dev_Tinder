const mongoose = require('mongoose')

const connectionrequestschema = mongoose.Schema({
    fromUserid: { type: mongoose.Schema.Types.ObjectId,
        ref:"user"
     },
    toUserid: { type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    status: {
        type: String,
        enum: {
            values: ["interested", "ignored", "accepted", "rejected"],
            message: `{VALUE} cannot come into status`
        }
    }
}, { timestamps: true });


const ConnectionRequest = new mongoose.model("connectionrequest",connectionrequestschema);

module.exports = ConnectionRequest;
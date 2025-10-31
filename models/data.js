const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({

    name: {
        type: String,
        
    },
    img: {
        type: String,
        
    },
    summary: {
        type: String,
      
    }

})

module.exports=mongoose.model('Data',dataSchema);
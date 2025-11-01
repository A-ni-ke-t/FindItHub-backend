const dataModel = require('../models/data');
const { authSchemaPatch, authSchemaPut} = require('../validationSchema');
const sampleData = require('../sampleData')

class Data{

    async newEntry(req,res){
        const data = new dataModel({
            name: req.body.name,
            img: req.body.img,
            summary: req.body.summary
        });
    
        try {
            const data1 = await data.save();
            res.status(200).json(data1);
        } catch (err) {
            res.status(500).send('Error: ' + err);
        }
    }

}

module.exports = { Data };
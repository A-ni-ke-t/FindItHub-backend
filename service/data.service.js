const dataModel = require('../models/data');
const { authSchemaPatch, authSchemaPut} = require('../validationSchema');
const sampleData = require('../sampleData')

class Data{

   async getAll(req,res){
        try {
            const data = await dataModel.find();
            res.status(200).json(data);
        } catch (err) {
            res.status(500).send('Error: ' + err);
        }
    }

    async getOne(req,res){
        try {
            const data = await dataModel.findById(req.params.id);
            if (data === null) {
                res.status(404).json({ msg: "Data not found" });
            } else {
                res.status(200).json(data);
            }
        } catch (err) {
            res.status(500).send('Error: ' + err);
        }
    }

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

    async updateSingleData(req,res){
        try {
            const reqBody = req.body;
            const data = await dataModel.findById(req.params.id);
    
            const { error } = authSchemaPatch.validate(reqBody);
    
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
    
            if (!data) {
                res.status(404).json({ msg: "Data not found" });
            } else {
                if (reqBody.name) data.name = reqBody.name;
                if (reqBody.img) data.img = reqBody.img;
                if (reqBody.summary) data.summary = reqBody.summary;
    
                const updatedData = await data.save();
                res.status(200).json(updatedData);
            }
        } catch (err) {
            res.status(500).send('Error: ' + err);
        }
    }

    async updateAllData(req,res){
        try {
            const reqBody = req.body;
            const updatedData = await dataModel.findOneAndUpdate({ _id: req.params.id }, reqBody);
    
            const { error } = authSchemaPut.validate(reqBody);
    
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
    
    
            if (!updatedData) {
                res.status(404).json({ msg: "Data not found" });
            } else {
                res.status(200).json(updatedData);
            }
        } catch (err) {
            res.status(500).send('Error: ' + err);
        }
    }

    async deleteAll(req,res){
        try {
            const data = await dataModel.findByIdAndDelete(req.params.id);
            if (!data) {
                res.status(404).send('Record not found');
            } else {
                res.status(200).send('Record deleted successfully');
            }
        } catch (err) {
            res.status(500).send('Error: ' + err);
        }
    }
}

module.exports = { Data };
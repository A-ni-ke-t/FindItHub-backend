const express = require('express');
const router = express.Router();
const { Data } = require('../service/data.service');
const useFunctions = new Data();

router.get('/', (req, res) => {
    useFunctions.getAll(req, res);
});

router.get('/:id', (req, res) => {
    useFunctions.getOne(req, res);
});

router.post('/', (req, res) => {
    useFunctions.newEntry(req, res);
});

router.patch('/:id', (req, res) => {
    useFunctions.updateSingleData(req, res);

});

router.put('/:id', (req, res) => {
    useFunctions.updateAllData(req, res);

});

router.delete('/:id', (req, res) => {
    useFunctions.deleteAll(req, res);

});

module.exports = router;

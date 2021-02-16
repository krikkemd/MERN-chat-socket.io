const factoryController = require('./factoryController');
const { Group } = require('../models/GroupModel');

exports.getAllGroups = factoryController.getAllDocuments(Group);
exports.getSingleGroup = factoryController.getSingleDoc(Group);
exports.createGroup = factoryController.createOne(Group);
exports.updateGroup = factoryController.updateOne(Group);
exports.deleteGroup = factoryController.deleteOne(Group);

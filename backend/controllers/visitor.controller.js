const db = require("../models");
const Visitor = db.visitors;

exports.create = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    if (!name || !mobile) {
      return res.status(400).send({ message: "Content can not be empty!" });
    }

    const visitor = await Visitor.create({ name, mobile });
    res.send(visitor);
  } catch (err) {
    res.status(500).send({ message: err.message || "Some error occurred while creating the Visitor." });
  }
};

exports.findAll = async (req, res) => {
  try {
    const data = await Visitor.findAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({ message: err.message || "Some error occurred while retrieving visitors." });
  }
};

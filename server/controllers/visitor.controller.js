const { Visitor } = require("../models");

exports.create = async (req, res) => {
  try {
    const { name, mobile, email } = req.body;
    if (!name || !mobile || !email) {
      return res.status(400).send({ message: "Name, Mobile and Email are mandatory!" });
    }

    const visitor = await Visitor.create(name, mobile, email);
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

exports.lookup = async (req, res) => {
  try {
    const { mobile } = req.params;
    const visitor = await Visitor.findByMobile(mobile);
    if (!visitor) {
      return res.status(404).send({ message: "Visitor not found." });
    }
    res.send(visitor);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error looking up visitor." });
  }
};

exports.updateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ message: "Email is required." });
    }
    await Visitor.updateEmail(id, email);
    res.send({ id, email, message: "Email updated successfully." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error updating visitor email." });
  }
};

const { User } = require("../models");
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).send({ message: "UserId and password are required!" });
    }

    const user = await User.findOne(user_id);

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    if (user.password !== password) {
      return res.status(401).send({ message: "Invalid Password!" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, user_id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    // Set cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).send({
      id: user.id,
      user_id: user.user_id,
      message: "Login successful!"
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('auth_token');
  res.status(200).send({ message: "Logout successful!" });
};

exports.verify = (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(200).send({ authenticated: false, message: "No token provided!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    res.status(200).send({ user_id: decoded.user_id });
  });
};

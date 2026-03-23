module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    name: { type: Sequelize.STRING },
    user_id: { type: Sequelize.STRING, unique: true },
    email: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING },
    phone: { type: Sequelize.STRING }
  });
  return User;
};

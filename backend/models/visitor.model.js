module.exports = (sequelize, Sequelize) => {
  const Visitor = sequelize.define("visitor", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    mobile: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  return Visitor;
};

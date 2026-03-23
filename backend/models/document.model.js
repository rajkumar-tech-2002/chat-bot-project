module.exports = (sequelize, Sequelize) => {
  const Document = sequelize.define("document", {
    title: { type: Sequelize.STRING },
    file_path: { type: Sequelize.STRING }
  });
  return Document;
};

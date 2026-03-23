module.exports = (sequelize, Sequelize) => {
  const Conversation = sequelize.define("conversation", {
    user_id: { type: Sequelize.INTEGER },
    question: { type: Sequelize.TEXT },
    answer: { type: Sequelize.TEXT },
    category: { type: Sequelize.STRING }
  });
  return Conversation;
};

const { User, Visitor, Conversation, VoiceLog, Document, pool } = require("../models");

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await Visitor.countAll();
    const totalConversations = await Conversation.countAll();
    const totalVoiceLogs = await VoiceLog.countAll();
    
    // Using .query for simple parameterless queries is often more efficient/robust
    const [docRow] = await pool.query('SELECT COUNT(*) as total FROM documents');
    const totalDocuments = docRow[0].total;

    // Last 7 days activity trend
    const [activityTrend] = await pool.query(`
      SELECT DATE(createdAt) as date, COUNT(*) as count 
      FROM conversations 
      WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
      GROUP BY DATE(createdAt) 
      ORDER BY date ASC
    `);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalConversations,
        totalVoiceLogs,
        totalDocuments
      },
      activityTrend
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const { startDate, endDate, month, year, type = 'all' } = req.query;
    const filters = { startDate, endDate, month, year };

    let conversations = [];
    let voiceLogs = [];

    if (type === 'all' || type === 'chat') {
       conversations = await Conversation.findAll(filters);
    }
    
    if (type === 'all' || type === 'voice') {
       voiceLogs = await VoiceLog.findAll(filters);
    }

    // Merge and sort by date
    const combined = [
      ...conversations.map(c => ({ ...c, type: 'chat', date: c.createdAt })),
      ...voiceLogs.map(v => ({ ...v, type: 'voice', date: v.created_at, question: v.question_text, answer: v.answer_text }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      logs: combined
    });
  } catch (error) {
    console.error("Admin activity logs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.findAll();
    
    // For each visitor, get their last activity date
    const visitorsWithActivity = await Promise.all(visitors.map(async (v) => {
        if (!v || !v.id) return { ...v, lastActivity: v.createdAt };
        
        // Use .query for better flexibility or .execute with explicit params
        const [lastConv] = await pool.query(
            'SELECT createdAt FROM conversations WHERE visitor_id = ? ORDER BY createdAt DESC LIMIT 1',
            [v.id]
        );
        return {
            ...v,
            lastActivity: lastConv.length > 0 ? lastConv[0].createdAt : v.createdAt
        };
    }));

    res.json({
      success: true,
      visitors: visitorsWithActivity
    });
  } catch (error) {
    console.error("Admin visitors error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

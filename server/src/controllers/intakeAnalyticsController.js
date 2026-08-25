import IntakeSession from '../models/IntakeSession.js';
import ClinicalFact from '../models/ClinicalFact.js';
import Document from '../models/Document.js';
import { sendSuccess } from '../utils/errors.js';

export const getIntakeAnalytics = async (req, res, next) => {
  try {
    const orgFilter = req.user?.organizationId ? { organizationId: req.user.organizationId } : {};

    const [
      totalSessions,
      completedSessions,
      abandonedSessions,
      inProgressSessions,
      allCompletedDocs,
      totalFacts,
      verifiedFacts,
      rejectedFacts,
      languageDistribution,
      disciplineDistribution,
    ] = await Promise.all([
      IntakeSession.countDocuments(orgFilter),
      IntakeSession.countDocuments({ ...orgFilter, status: 'COMPLETED' }),
      IntakeSession.countDocuments({ ...orgFilter, status: 'ABANDONED' }),
      IntakeSession.countDocuments({ ...orgFilter, status: 'IN_PROGRESS' }),
      IntakeSession.find({ ...orgFilter, status: 'COMPLETED', completedAt: { $exists: true } })
        .select('startedAt completedAt redFlags language discipline')
        .lean(),
      ClinicalFact.countDocuments(),
      ClinicalFact.countDocuments({ verificationStatus: { $in: ['ACCEPTED', 'EDITED'] } }),
      ClinicalFact.countDocuments({ verificationStatus: 'REJECTED' }),
      IntakeSession.aggregate([
        { $match: orgFilter },
        { $group: { _id: '$language', count: { $sum: 1 } } },
      ]),
      IntakeSession.aggregate([
        { $match: orgFilter },
        { $group: { _id: '$discipline', count: { $sum: 1 } } },
      ]),
    ]);

    // Average duration calculation in minutes
    let totalDurationMs = 0;
    let countedSessions = 0;
    let redFlagsCount = 0;

    for (const s of allCompletedDocs) {
      if (s.startedAt && s.completedAt) {
        const diff = new Date(s.completedAt) - new Date(s.startedAt);
        if (diff > 0 && diff < 3600000) {
          // between 0 and 60 minutes
          totalDurationMs += diff;
          countedSessions++;
        }
      }
      if (s.redFlags && s.redFlags.length > 0) {
        redFlagsCount += s.redFlags.length;
      }
    }

    const avgDurationMinutes =
      countedSessions > 0 ? (totalDurationMs / countedSessions / 60000).toFixed(1) : 4.5;

    const totalUploadedDocs = await Document.countDocuments({
      title: { $regex: /Kiosk|OPD|Prescription|Lab/i },
    });

    return sendSuccess(res, {
      metrics: {
        totalSessions,
        completedSessions,
        abandonedSessions,
        inProgressSessions,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
        avgDurationMinutes: Number(avgDurationMinutes),
        redFlagsDetected: redFlagsCount,
        totalFactsExtracted: totalFacts,
        factsVerifiedByDoctor: verifiedFacts,
        factsRejectedByDoctor: rejectedFacts,
        doctorVerificationRate: totalFacts > 0 ? Math.round((verifiedFacts / totalFacts) * 100) : 0,
        totalDocumentsUploaded: totalUploadedDocs,
      },
      languageBreakdown: languageDistribution.map((l) => ({ language: l._id || 'en', count: l.count })),
      disciplineBreakdown: disciplineDistribution.map((d) => ({ discipline: d._id || 'MODERN_MEDICINE', count: d.count })),
    });
  } catch (err) {
    next(err);
  }
};

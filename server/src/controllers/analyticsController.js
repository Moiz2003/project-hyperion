'use strict'

const ScanResult = require('../models/ScanResult')
const { isMongoConnected } = require('../db')
const { logger } = require('../utils/logger')

async function getAnalytics(req, res) {
  if (!isMongoConnected()) {
    return res.status(200).json({
      status: 'success',
      data: {
        total_scans: 0,
        success_rate: 100,
        partial_count: 0,
        consensus_first_pass_rate: 0,
        avg_critic_interventions: '0.00',
        urgency_distribution: { High: 0, Moderate: 0, Low: 0 },
        top_departments: [],
        timeline: [],
      },
    })
  }
  try {
    const [
      totalScans,
      urgencyDist,
      deptDist,
      avgInterventions,
      partialCount,
      recentLatencies,
    ] = await Promise.all([
      ScanResult.countDocuments(),

      ScanResult.aggregate([
        { $group: { _id: '$urgencyFlag', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      ScanResult.aggregate([
        { $group: { _id: '$recommendedDept', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),

      ScanResult.aggregate([
        { $group: { _id: null, avg: { $avg: '$criticInterventions' } } },
      ]),

      ScanResult.countDocuments({ partial: true }),

      ScanResult.find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .select('criticInterventions urgencyFlag createdAt partial')
        .lean(),
    ])

    const successRate = totalScans === 0 ? 100
      : Math.round(((totalScans - partialCount) / totalScans) * 100)

    const zeroInterventionCount = recentLatencies.filter(s => s.criticInterventions === 0).length
    const consensusFirstPassRate = recentLatencies.length === 0 ? 0
      : Math.round((zeroInterventionCount / recentLatencies.length) * 100)

    const urgencyMap = Object.fromEntries(urgencyDist.map(u => [u._id, u.count]))
    const deptMap = deptDist.map(d => ({ dept: d._id, count: d.count }))

    // Timeline: last 20 scans for a sparkline
    const timeline = recentLatencies.slice(0, 20).reverse().map((s, i) => ({
      index: i + 1,
      interventions: s.criticInterventions,
      urgency: s.urgencyFlag,
      partial: s.partial,
      createdAt: s.createdAt,
    }))

    res.json({
      status: 'success',
      data: {
        total_scans: totalScans,
        success_rate: successRate,
        partial_count: partialCount,
        consensus_first_pass_rate: consensusFirstPassRate,
        avg_critic_interventions: avgInterventions[0]?.avg?.toFixed(2) ?? '0.00',
        urgency_distribution: {
          High: urgencyMap.High || 0,
          Moderate: urgencyMap.Moderate || 0,
          Low: urgencyMap.Low || 0,
        },
        top_departments: deptMap,
        timeline,
      },
    })
  } catch (err) {
    logger.error({ err: err.message }, 'Analytics query failed')
    res.status(500).json({ status: 'error', message: 'Analytics unavailable' })
  }
}

module.exports = { getAnalytics }

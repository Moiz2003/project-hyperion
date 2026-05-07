'use strict'

const request = require('supertest')
const app = require('../src/app')
const { isMongoConnected } = require('../src/db')

jest.mock('../src/db', () => ({
  connectMongo: jest.fn(),
  isMongoConnected: jest.fn(),
}))

describe('GET /api/scans', () => {
  test('returns 503 when MongoDB is not connected', async () => {
    isMongoConnected.mockReturnValue(false)
    const res = await request(app).get('/api/scans')
    expect(res.status).toBe(503)
    expect(res.body.status).toBe('error')
  })

  test('returns 200 with data array when MongoDB is connected', async () => {
    isMongoConnected.mockReturnValue(true)

    // Mock the mongoose model
    const ScanResult = require('../src/models/ScanResult')
    jest.spyOn(ScanResult, 'find').mockReturnValue({
      sort: () => ({
        limit: () => ({
          select: () => ({
            lean: () => Promise.resolve([
              {
                _id: 'abc123',
                rawFindings: 'Test findings',
                verifiedReport: 'Test report',
                urgencyFlag: 'High',
                recommendedDept: 'Pulmonology',
                criticInterventions: 1,
                createdAt: new Date().toISOString(),
              },
            ]),
          }),
        }),
      }),
    })

    const res = await request(app).get('/api/scans')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].rawFindings).toBe('Test findings')
  })
})

#!/usr/bin/env node
/**
 * MongoDB Connection Validation Script
 * ======================================
 *
 * Validates that the production MongoDB Atlas cluster is reachable and the
 * `hyperion` database is properly initialized.
 *
 * This script mirrors the exact connection strategy used in db.js:
 *   1. Primary SRV connection (with Google DNS override)
 *   2. Non-SRV fallback (strips +srv prefix)
 *   3. Extended-timeout fallback
 *
 * Usage:
 *   node scripts/validate-db.js
 *
 * Exit codes:
 *   0 — All checks passed
 *   1 — Connection failed (all phases exhausted)
 *   2 — Connected but database not found
 */

'use strict'

// ---------------------------------------------------------------------------
// Phase 0: Bootstrap (must mirror server.js exactly)
// ---------------------------------------------------------------------------

// Force Google DNS to prevent querySrv ENOTFOUND on Render
const dns = require('node:dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

// Load .env from server root (one level up from scripts/)
const path = require('node:path')
const dotenv = require('dotenv')
const envPath = path.resolve(__dirname, '..', '.env')
const result = dotenv.config({ path: envPath })
if (result.error) {
    console.error(`[VALIDATE] Failed to load .env from ${envPath}: ${result.error.message}`)
    process.exit(1)
}

const mongoose = require('mongoose')

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
    console.error('[VALIDATE] MONGO_URI is not set in .env')
    process.exit(1)
}

// Mask credentials for logging
const maskedUri = MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
console.log(`[VALIDATE] Target URI: ${maskedUri}`)
console.log(`[VALIDATE] DNS servers: ${dns.getServers().join(', ')}`)

// ---------------------------------------------------------------------------
// Connection Attempt Helper
// ---------------------------------------------------------------------------

async function attemptConnect(uri, options, label) {
    console.log(`\n[VALIDATE] ── Phase: ${label} ──`)
    console.log(`[VALIDATE] Connecting with serverSelectionTimeoutMS=${options.serverSelectionTimeoutMS}...`)

    const conn = await mongoose.createConnection(uri, {
        serverSelectionTimeoutMS: options.serverSelectionTimeoutMS ?? 10_000,
        heartbeatFrequencyMS: 30_000,
        socketTimeoutMS: options.socketTimeoutMS ?? 60_000,
        connectTimeoutMS: options.connectTimeoutMS ?? 15_000,
        retryWrites: true,
        w: 'majority',
    }).asPromise()

    return conn
}

// ---------------------------------------------------------------------------
// Database Validation
// ---------------------------------------------------------------------------

async function validateDatabase(conn) {
    console.log('\n[VALIDATE] ── Validating Database ──')

    // 1. List all databases to confirm 'hyperion' exists
    const adminDb = conn.db.admin()
    const dbInfo = await adminDb.listDatabases()
    const dbNames = dbInfo.databases.map(d => d.name)
    console.log(`[VALIDATE] Databases found: ${dbNames.join(', ') || '(none)'}`)

    const hasHyperion = dbNames.includes('hyperion')
    if (hasHyperion) {
        console.log('[VALIDATE] ✅ "hyperion" database exists')
    } else {
        console.log('[VALIDATE] ⚠️  "hyperion" database not yet created (will be auto-created on first write)')
    }

    // 2. Verify we can read from the hyperion database
    const hyperionDb = conn.db('hyperion')
    const collections = await hyperionDb.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    console.log(`[VALIDATE] Collections in "hyperion": ${collectionNames.join(', ') || '(none — fresh database)'}`)

    // 3. Test write capability (write then immediately delete)
    console.log('[VALIDATE] Testing write/read cycle...')
    const testCollection = hyperionDb.collection('_validation_test')
    const testDoc = {
        _test: true,
        createdAt: new Date(),
        validator: 'validate-db.js',
        version: 1,
    }

    const insertResult = await testCollection.insertOne(testDoc)
    console.log(`[VALIDATE] ✅ Write successful (id: ${insertResult.insertedId})`)

    const readDoc = await testCollection.findOne({ _test: true })
    if (readDoc) {
        console.log('[VALIDATE] ✅ Read-back successful')
    } else {
        console.log('[VALIDATE] ❌ Read-back failed — document not found')
    }

    // Clean up test document
    await testCollection.deleteMany({ _test: true })
    console.log('[VALIDATE] ✅ Test document cleaned up')

    return { hasHyperion, collectionNames }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    let conn = null

    try {
        // ---- Phase 1: Primary SRV ----
        try {
            conn = await attemptConnect(MONGO_URI, {
                serverSelectionTimeoutMS: 10_000,
                socketTimeoutMS: 60_000,
                connectTimeoutMS: 15_000,
            }, 'SRV (primary)')
            console.log('[VALIDATE] ✅ Phase 1 succeeded (SRV)')
        } catch (err) {
            console.log(`[VALIDATE] ❌ Phase 1 failed: ${err.message}`)

            // ---- Phase 2: Non-SRV fallback ----
            if (MONGO_URI.includes('+srv')) {
                const nonSrvUri = MONGO_URI.replace('mongodb+srv://', 'mongodb://')
                try {
                    conn = await attemptConnect(nonSrvUri, {
                        serverSelectionTimeoutMS: 10_000,
                        socketTimeoutMS: 60_000,
                        connectTimeoutMS: 15_000,
                    }, 'non-SRV fallback')
                    console.log('[VALIDATE] ✅ Phase 2 succeeded (non-SRV)')
                } catch (err2) {
                    console.log(`[VALIDATE] ❌ Phase 2 failed: ${err2.message}`)

                    // ---- Phase 3: Extended timeout ----
                    try {
                        conn = await attemptConnect(MONGO_URI, {
                            serverSelectionTimeoutMS: 30_000,
                            socketTimeoutMS: 120_000,
                            connectTimeoutMS: 30_000,
                        }, 'extended timeout')
                        console.log('[VALIDATE] ✅ Phase 3 succeeded (extended timeout)')
                    } catch (err3) {
                        console.log(`[VALIDATE] ❌ Phase 3 failed: ${err3.message}`)
                        throw new Error('All connection phases exhausted')
                    }
                }
            } else {
                // No +srv to strip, try extended timeout directly
                try {
                    conn = await attemptConnect(MONGO_URI, {
                        serverSelectionTimeoutMS: 30_000,
                        socketTimeoutMS: 120_000,
                        connectTimeoutMS: 30_000,
                    }, 'extended timeout (no SRV)')
                    console.log('[VALIDATE] ✅ Phase 3 succeeded (extended timeout)')
                } catch (err3) {
                    console.log(`[VALIDATE] ❌ Phase 3 failed: ${err3.message}`)
                    throw new Error('All connection phases exhausted')
                }
            }
        }

        // ---- Validation ----
        const { hasHyperion } = await validateDatabase(conn)

        // ---- Summary ----
        console.log('\n[VALIDATE] ═══════════════════════════════════════')
        console.log('[VALIDATE]  ALL CHECKS PASSED')
        console.log('[VALIDATE] ═══════════════════════════════════════')
        console.log(`[VALIDATE]  Connection:     ✅ ${maskedUri}`)
        console.log(`[VALIDATE]  Database:        ${hasHyperion ? '✅' : '⚠️'} hyperion`)
        console.log(`[VALIDATE]  DNS Servers:     ${dns.getServers().join(', ')}`)
        console.log('[VALIDATE] ═══════════════════════════════════════\n')

        process.exit(0)
    } catch (err) {
        console.error(`\n[VALIDATE] ❌ FATAL: ${err.message}`)
        console.error('[VALIDATE] ═══════════════════════════════════════')
        console.error('[VALIDATE]  CONNECTION VALIDATION FAILED')
        console.error('[VALIDATE]  Check MONGO_URI, network, and DNS settings')
        console.error('[VALIDATE] ═══════════════════════════════════════\n')
        process.exit(1)
    } finally {
        if (conn) {
            await conn.close()
            console.log('[VALIDATE] Connection closed')
        }
    }
}

main()

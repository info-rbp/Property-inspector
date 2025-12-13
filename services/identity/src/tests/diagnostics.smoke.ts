// This test runs against the local server. Ensure server is running before executing.
import assert from 'assert';

// Fix TS errors for node globals in test script when types are missing
declare var process: any;

const BASE_URL = 'http://localhost:3000/v1';

async function testDiagnostics() {
  console.log('🧪 Running Diagnostics Smoke Tests...');

  try {
    // 1. Test Health (Liveness)
    console.log('Checking /health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(healthRes.status, 200, '/health should return 200');
    
    const healthBody = await healthRes.json();
    assert.strictEqual(healthBody.status, 'ok');
    assert.ok(typeof healthBody.uptimeSeconds === 'number', 'uptimeSeconds should be a number');
    assert.strictEqual(healthBody.service, 'identity-service');
    console.log('✅ /health OK');

    // 2. Test Ready (Readiness)
    console.log('Checking /ready...');
    const readyRes = await fetch(`${BASE_URL}/ready`);
    
    // We parse body regardless of status to check structure
    const readyBody = await readyRes.json();
    
    assert.strictEqual(typeof readyBody.ready, 'boolean');
    assert.ok(readyBody.checks, 'Checks object missing');
    assert.ok(readyBody.checks.database, 'Missing DB check');
    assert.ok(readyBody.checks.jwtKeys, 'Missing JWT Keys check');
    assert.ok(readyBody.checks.jwks, 'Missing JWKS check');
    
    // Check specific contracts for check objects
    assert.strictEqual(typeof readyBody.checks.database.ok, 'boolean');
    assert.strictEqual(typeof readyBody.checks.database.latencyMs, 'number');

    if (readyRes.status === 200) {
      assert.strictEqual(readyBody.ready, true);
      console.log('✅ /ready is OK (200) - Service Ready');
    } else if (readyRes.status === 503) {
      assert.strictEqual(readyBody.ready, false);
      console.warn('⚠️ /ready returned 503. Service Not Ready (Expected if DB is down)');
      console.log('Failure details:', JSON.stringify(readyBody.checks, null, 2));
    } else {
      throw new Error(`Unexpected status code: ${readyRes.status}`);
    }

  } catch (error) {
    console.error('❌ Diagnostics Smoke Test Failed:', error);
    process.exit(1);
  }
}

testDiagnostics();

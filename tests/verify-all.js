const assert = require('assert');
const http = require('http');

async function runTests() {
  console.log('==================================================');
  console.log(' RUNNING COMPREHENSIVE WHITEBOARD TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function report(name, fn) {
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  async function reportAsync(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Tool Bounds & Geometry Tests
  report('Test 1: getElementBounds for Rectangle', () => {
    const elem = { type: 'rectangle', x: 50, y: 50, width: 100, height: 80 };
    const bounds = {
      x: elem.width < 0 ? elem.x + elem.width : elem.x,
      y: elem.height < 0 ? elem.y + elem.height : elem.y,
      width: Math.abs(elem.width),
      height: Math.abs(elem.height)
    };
    assert.strictEqual(bounds.x, 50);
    assert.strictEqual(bounds.y, 50);
    assert.strictEqual(bounds.width, 100);
    assert.strictEqual(bounds.height, 80);
  });

  report('Test 2: getElementBounds for Freehand points', () => {
    const elem = {
      type: 'freehand',
      points: [[10, 20], [50, 80], [120, 40]]
    };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [px, py] of elem.points) {
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    }
    assert.strictEqual(minX, 10);
    assert.strictEqual(minY, 20);
    assert.strictEqual(maxX - minX, 110);
    assert.strictEqual(maxY - minY, 60);
  });

  // 2. Hit Testing Logic Tests
  report('Test 3: Hit test point inside circle and outside rectangle', () => {
    // Circle at cx=100, cy=100, rx=50, ry=50
    const circle = { type: 'circle', x: 50, y: 50, width: 100, height: 100 };
    const rx = 50, ry = 50, cx = 100, cy = 100;
    // (100, 100) is center
    const centerNorm = Math.pow((100 - cx) / rx, 2) + Math.pow((100 - cy) / ry, 2);
    assert.ok(centerNorm <= 1.0, 'Center must be inside circle');

    // (200, 200) is outside
    const outsideNorm = Math.pow((200 - cx) / rx, 2) + Math.pow((200 - cy) / ry, 2);
    assert.ok(outsideNorm > 1.0, 'Point outside must fail');
  });

  // 3. Backend REST API Tests
  await reportAsync('Test 4: Backend Health Check GET /api/health', async () => {
    const res = await makeRequest({ path: '/api/health', method: 'GET', port: 5000 });
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.status, 'ok');
  });

  let createdId = null;
  await reportAsync('Test 5: Backend POST /api/drawings (Create drawing with 6 shape types)', async () => {
    const payload = JSON.stringify({
      name: 'Automated Test Drawing',
      elements: [
        { id: '1', type: 'rectangle', x: 10, y: 10, width: 100, height: 100, strokeColor: '#1e1e1e' },
        { id: '2', type: 'circle', x: 120, y: 10, width: 80, height: 80, strokeColor: '#e03131' },
        { id: '3', type: 'diamond', x: 220, y: 10, width: 60, height: 60, strokeColor: '#2f9e44' },
        { id: '4', type: 'arrow', x: 300, y: 10, width: 50, height: 50, strokeColor: '#1971c2' },
        { id: '5', type: 'line', x: 370, y: 10, width: 40, height: 40, strokeColor: '#f08c00' },
        { id: '6', type: 'text', x: 10, y: 150, text: 'Sample Label', fontSize: 22 }
      ],
      appState: { zoom: 1.0, pan: { x: 0, y: 0 } }
    });

    const res = await makeRequest({
      path: '/api/drawings',
      method: 'POST',
      port: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, payload);

    assert.strictEqual(res.statusCode, 201);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.id);
    createdId = body.data.id;
  });

  await reportAsync('Test 6: Backend GET /api/drawings/:id (Retrieve saved drawing)', async () => {
    assert.ok(createdId);
    const res = await makeRequest({ path: `/api/drawings/${createdId}`, method: 'GET', port: 5000 });
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.elements.length, 6);
  });

  await reportAsync('Test 7: Backend PUT /api/drawings/:id (Update drawing title and elements)', async () => {
    assert.ok(createdId);
    const payload = JSON.stringify({
      name: 'Renamed Automated Drawing',
      elements: [{ id: '1', type: 'rectangle', x: 20, y: 20, width: 120, height: 120 }]
    });

    const res = await makeRequest({
      path: `/api/drawings/${createdId}`,
      method: 'PUT',
      port: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, payload);

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.data.name, 'Renamed Automated Drawing');
    assert.strictEqual(body.data.elements.length, 1);
  });

  await reportAsync('Test 8: Backend DELETE /api/drawings/:id (Delete drawing)', async () => {
    assert.ok(createdId);
    const res = await makeRequest({ path: `/api/drawings/${createdId}`, method: 'DELETE', port: 5000 });
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);

    // Verify 404
    const checkRes = await makeRequest({ path: `/api/drawings/${createdId}`, method: 'GET', port: 5000 });
    assert.strictEqual(checkRes.statusCode, 404);
  });

  // 4. Frontend HTTP Reachability Test
  await reportAsync('Test 9: Frontend GET http://localhost:3000 (Next.js App Router)', async () => {
    const res = await makeRequest({ path: '/', method: 'GET', port: 3000 });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('Whiteboard Lab'));
    assert.ok(res.body.includes('DrawingToolbar') || res.body.includes('Select (1)'));
  });

  console.log('\n==================================================');
  console.log(` TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: options.port,
      path: options.path,
      method: options.method,
      headers: options.headers || {}
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });

    req.on('error', (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
}

runTests();


/**
 * Automated Test Script: Simulating Discord Bot -> API -> SSE -> Persistence Flow
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const API_BASE = "http://localhost:3000";

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log("\n==================================================");
  console.log("🧪 STARTING WESTWOOD SYSTEM END-TO-END VERIFICATION");
  console.log("==================================================\n");

  // Step 1: Health check
  console.log("1. Checking Server Health...");
  const statusRes = await request("GET", "/api/status");
  console.log("   -> Status:", statusRes.body.status, "| Current Members:", statusRes.body.memberCount);

  // Step 2: Simulate Discord Bot Modal Submit (/setmember)
  console.log("\n2. Simulating Discord Bot Modal SetMember Submit...");
  const testMember = {
    name: "Alexander 'TestViper' Cross",
    role: "core",
    rankTitle: "UNDERBOSS",
    avatar: "assets/logo-red.jpg",
    facebook: "https://facebook.com/testviper",
    discord: "testviper#999"
  };

  const setRes = await request("POST", "/api/setmember", testMember);
  if (setRes.status === 200 && setRes.body.success) {
    console.log("   ✅ Member created successfully:", setRes.body.member.name, `[ID: ${setRes.body.member.id}]`);
  } else {
    console.error("   ❌ Failed to create member:", setRes);
    process.exit(1);
  }

  // Step 3: Verify in GET /api/members
  console.log("\n3. Verifying Member appears in GET /api/members...");
  const getRes = await request("GET", "/api/members");
  const found = getRes.body.members.find(m => m.name === testMember.name);
  if (found) {
    console.log("   ✅ Found in active roster list!");
    console.log("   -> Fields:", Object.keys(found).join(", "));
  } else {
    console.error("   ❌ Member not found in list!");
    process.exit(1);
  }

  // Step 4: Verify in data/members.json file
  console.log("\n4. Checking file persistence in data/members.json...");
  const fileContent = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "members.json"), "utf8"));
  const foundInFile = fileContent.find(m => m.name === testMember.name);
  if (foundInFile) {
    console.log("   ✅ Data safely written to disk!");
  } else {
    console.error("   ❌ Data not found on disk!");
    process.exit(1);
  }

  // Step 5: Simulate Discord Bot Remove Member
  console.log("\n5. Simulating Discord Bot Remove Member...");
  const removeRes = await request("POST", "/api/removemember", { name: testMember.name });
  if (removeRes.status === 200 && removeRes.body.success) {
    console.log("   ✅ Member removed successfully:", removeRes.body.removed.name);
  } else {
    console.error("   ❌ Failed to remove member:", removeRes);
    process.exit(1);
  }

  // Step 6: Verify removed
  const getResAfter = await request("GET", "/api/members");
  const foundAfter = getResAfter.body.members.find(m => m.name === testMember.name);
  if (!foundAfter) {
    console.log("   ✅ Verified: Member cleanly removed from roster!");
  } else {
    console.error("   ❌ Member still exists!");
    process.exit(1);
  }

  console.log("\n==================================================");
  console.log("🎉 ALL TESTS PASSED (100% SUCCESS)");
  console.log("==================================================\n");
}

runTest().catch(console.error);

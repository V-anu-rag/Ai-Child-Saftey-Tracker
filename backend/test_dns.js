const dns = require('dns');

const srvRecord = "_mongodb._tcp.cluster0.u1t0fhw.mongodb.net";

console.log("🔍 Looking up shards for: " + srvRecord);

dns.resolveSrv(srvRecord, (err, addresses) => {
  if (err) {
    console.error("❌ DNS Error: Your network is completely blocking SRV lookups.");
    console.error(err);
    return;
  }

  console.log("\n✅ SHARDS FOUND! Use these in your Standard String:\n");
  addresses.forEach(addr => {
    console.log(`- ${addr.name}:${addr.port}`);
  });
  
  console.log("\nCopy these shard names and I will build your .env string for you.");
});

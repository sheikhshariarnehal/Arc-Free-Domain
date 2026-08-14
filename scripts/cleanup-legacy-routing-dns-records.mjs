#!/usr/bin/env node
/**
 * One-off cleanup: remove real Cloudflare DNS records that were created for
 * A/CNAME "routing" targets before the wildcard *.arc.bd + app-level reverse
 * proxy architecture existed. Those records are now redundant (the app
 * resolves routing straight from `dns_records` via the
 * `resolve_subdomain_target` RPC), and every one left in Cloudflare counts
 * against the zone's 200 DNS-record hard limit.
 *
 * This script only talks to the Cloudflare API (using CLOUDFLARE_API_TOKEN /
 * CLOUDFLARE_ZONE_ID from .env.local). After it reports success, the
 * corresponding `dns_records.cloudflare_record_id` column is cleared
 * separately via the Supabase MCP connection — the row itself is always
 * kept, since the app's reverse proxy still needs it.
 *
 * Usage:
 *   node scripts/cleanup-legacy-routing-dns-records.mjs          # dry run (default)
 *   node scripts/cleanup-legacy-routing-dns-records.mjs --apply  # actually delete
 *
 * Nothing secret is ever printed to stdout.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(projectRoot, ".env.local");
  const env = {};
  if (!existsSync(envPath)) return env;
  const contents = readFileSync(envPath, "utf-8");
  for (const rawLine of contents.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const fileEnv = loadEnvLocal();
function getEnv(key) {
  return process.env[key] || fileEnv[key];
}

const APPLY = process.argv.includes("--apply");

const CLOUDFLARE_API_TOKEN = getEnv("CLOUDFLARE_API_TOKEN");
const CLOUDFLARE_ZONE_ID = getEnv("CLOUDFLARE_ZONE_ID");

if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
  console.error("Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID in .env.local");
  process.exit(1);
}

// Snapshot of dns_records rows (type A/CNAME, cloudflare_record_id NOT NULL)
// pulled from Supabase immediately before running this script.
const RECORDS = [
  { id: "0c88e484-d9b6-4742-9ce6-c10d89bbd710", name: "sdfsdf.arc.bd", cf: "e5875e69c1151a452dd93fe44fff19a2" },
  { id: "b96d1343-a606-4a67-895b-414a52ce219b", name: "shariarnehal.arc.bd", cf: "6e6ab6d6f6e2eb3353585ab632897d4e" },
  { id: "8e2db0bc-94bb-443f-b617-639cfeb26742", name: "test2.arc.bd", cf: "1a512bed3d0d12d8e11b86e3697c4987" },
  { id: "e785f9b5-aea0-4e2d-a529-a679c2443081", name: "cheak.arc.bd", cf: "65e443073d8177bf7dada9a842532ea3" },
  { id: "30140485-f61b-467f-8ee1-0cc0fcf4f7f0", name: "name.arc.bd", cf: "0227a71ef5c0614821a7a61b920d1743" },
  { id: "d2fcd30c-86f4-44c5-bf25-65e136e87b3b", name: "asdsadsad.arc.bd", cf: "d0a010b32795d0994eb5b5eeea36efd7" },
  { id: "beb500d0-139e-42b2-b960-366bb8acbf9c", name: "test1.arc.bd", cf: "d6da949287d7b3f8ce400859fd5ac4d9" },
  { id: "4e1f75f2-8ade-4813-a4fb-3dcc1143d010", name: "test3.arc.bd", cf: "8e098ecc211cf8a86bf5131e3cb79d87" },
  { id: "b610dcf1-7e94-4287-94b0-0d30df96bddf", name: "test4.arc.bd", cf: "938c5638370ffcc2cd984205b74b161f" },
  { id: "8889f7f8-bae2-4758-8e98-bfd58585fc2b", name: "test10.arc.bd", cf: "2cf0490a6bf970dca8f0c15e1f3b8609" },
  { id: "ef7a4350-886f-46db-a442-766ab53cf521", name: "test100.arc.bd", cf: "60fbf5ed74cf207d9b4456e71d60b63e" },
  { id: "18fb5ede-f2f3-4c4f-9f36-abffdd55ef00", name: "nehal.arc.bd", cf: "afd8dace5830bb7c874d08738c09493f" },
  { id: "9f1607e3-ef12-40e9-b22c-3142cb5c2474", name: "test32.arc.bd", cf: "96ff9f0569cfdb61d2c3a9c988147b53" },
  { id: "dcf98884-e435-4321-8793-7a9fd61e318b", name: "test30923.arc.bd", cf: "1d8fc9c13a23145e0c0387c3d017639e" },
  { id: "e70abe1e-845d-4350-b0c4-68b0df05936a", name: "map.arc.bd", cf: "fbd5c2dfc1accb4affde63fa61f56924" },
  { id: "1a013514-33e0-4e93-9509-871c30ef388d", name: "yes.arc.bd", cf: "626654b9d158380427ed3c43af851575" },
  { id: "e49218de-8599-48ae-a42b-bf1064837349", name: "cat.arc.bd", cf: "fb59120eaeb8d3077de571fa9b976de5" },
  { id: "529e68d0-7154-436f-9411-41552a5c85ed", name: "abc.arc.bd", cf: "d9e7204a13166607acf0a1ee70a58a8f" },
  { id: "80262970-fc5c-4bdf-9e77-cb5297289832", name: "you.arc.bd", cf: "f3d96b9f10e5e68d39a294e61fc8bab4" },
  { id: "b1a86ff7-ae29-45cc-99f2-b5c02ba419c0", name: "namecheak.arc.bd", cf: "5038ca606f8047972a9a77f4181b1567" },
  { id: "0fd83b60-f6dc-4fad-b6c2-10e5d13bbe4e", name: "000000000000000000.arc.bd", cf: "fc9ecc059c42d63303207c401adaa000" },
  { id: "173bc8d9-c2ad-4264-9f4b-25c56893d02f", name: "test99999.arc.bd", cf: "801855501dcc329091576b48ed641688" },
];

async function deleteCloudflareRecord(recordId) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${recordId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  const data = await res.json();
  return { success: Boolean(data?.success), errors: data?.errors ?? [] };
}

async function main() {
  console.log(
    APPLY
      ? "Running in APPLY mode (Cloudflare records will be deleted)."
      : "Running in DRY-RUN mode. Pass --apply to actually delete."
  );
  console.log(`${RECORDS.length} legacy record(s) targeted.\n`);

  if (!APPLY) {
    for (const r of RECORDS) console.log(`  - ${r.name}`);
    console.log("\nDry run complete. Re-run with --apply to delete these from Cloudflare.");
    return;
  }

  const cleanedIds = [];
  let failed = 0;

  for (const r of RECORDS) {
    try {
      const result = await deleteCloudflareRecord(r.cf);
      const alreadyGone = result.errors.some((e) => e.code === 81044);
      if (!result.success && !alreadyGone) {
        console.error(`  FAILED: ${r.name}`, result.errors);
        failed++;
      } else {
        console.log(`  OK: ${r.name}`);
        cleanedIds.push(r.id);
      }
    } catch (e) {
      console.error(`  ERROR: ${r.name}`, e instanceof Error ? e.message : e);
      failed++;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log(`\nDone. ${cleanedIds.length} deleted from Cloudflare, ${failed} failed.`);
  console.log("\nRow IDs to clear cloudflare_record_id for (via SQL):");
  console.log(JSON.stringify(cleanedIds));
  if (failed > 0) process.exitCode = 1;
}

main();

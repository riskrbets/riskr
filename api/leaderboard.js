import { Redis } from "@upstash/redis";

// The Upstash Marketplace integration injects KV_REST_API_* (optionally with a
// storage-name prefix, e.g. RISKR_STORAGE_KV_REST_API_*); a direct Upstash
// account uses UPSTASH_REDIS_REST_* . Accept any of them.
const redis = new Redis({
  url:
    process.env.KV_REST_API_URL ||
    process.env.RISKR_STORAGE_KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL,
  token:
    process.env.KV_REST_API_TOKEN ||
    process.env.RISKR_STORAGE_KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY_ALL = "riskr:board:alltime";
const MAX = 100;
const WEEK_TTL = 60 * 60 * 24 * 45; // ~45 days

function isoWeekId(d = new Date()) {
  const dt = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - day);
  const y = dt.getUTCFullYear();
  const start = new Date(Date.UTC(y, 0, 1));
  const wk = Math.ceil(((dt - start) / 86400000 + 1) / 7);
  return y + "-W" + String(wk).padStart(2, "0");
}
const keyWeek = () => "riskr:board:week:" + isoWeekId();

async function readBoard(key) {
  // withScores returns a flat [member, score, member, score, ...] array.
  const raw = await redis.zrange(key, 0, MAX - 1, {
    rev: true,
    withScores: true,
  });
  const entries = [];
  for (let i = 0; i < raw.length; i += 2) {
    let m = raw[i];
    if (typeof m === "string") {
      try {
        m = JSON.parse(m);
      } catch {
        continue;
      }
    }
    if (m && typeof m === "object")
      entries.push({ n: m.n, m: m.m, a: m.a, t: m.t });
  }
  entries.sort((a, b) => b.m - a.m || a.t - b.t);
  return entries;
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const board = req.query.board === "all" ? "all" : "week";
      const key = board === "all" ? KEY_ALL : keyWeek();
      return res.status(200).json({ entries: await readBoard(key) });
    }

    if (req.method === "POST") {
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};
      const name = String(body.name ?? "")
        .trim()
        .slice(0, 20);
      const mult = Number(body.multiplier);
      const amt = Number(body.amount);
      if (!name || !isFinite(mult) || !isFinite(amt)) {
        return res.status(400).json({ error: "invalid score" });
      }

      const entry = {
        n: name,
        m: Math.round(mult * 100) / 100,
        a: Math.round(amt * 100) / 100,
        t: Date.now(),
      };

      for (const key of [KEY_ALL, keyWeek()]) {
        await redis.zadd(key, { score: entry.m, member: entry });
        await redis.zremrangebyrank(key, 0, -(MAX + 1)); // keep top 100
      }
      await redis.expire(keyWeek(), WEEK_TTL);

      return res.status(200).json({ entry });
    }

    // TEMP: one-off maintenance to delete entries by name from both boards.
    if (req.method === "DELETE") {
      const target = String(req.query.name ?? "");
      if (!target) return res.status(400).json({ error: "name required" });
      let removed = 0;
      for (const key of [KEY_ALL, keyWeek()]) {
        const raw = await redis.zrange(key, 0, -1);
        for (const m of raw) {
          let parsed = m;
          if (typeof m === "string") {
            try {
              parsed = JSON.parse(m);
            } catch {
              continue;
            }
          }
          if (parsed && parsed.n === target) {
            removed += await redis.zrem(key, m);
          }
        }
      }
      return res.status(200).json({ removed });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
}

import { chromium } from "playwright";
import path from "node:path";

const BASE = "http://localhost:3001";
const OUT = ".readme-assets";

async function revealPage(page) {
  // Scroll incrementally so every IntersectionObserver-based reveal fires
  // before we screenshot, then jump back to top.
  await page.evaluate(async () => {
    const step = 400;
    const height = document.body.scrollHeight;
    for (let y = 0; y < height; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 300));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Home (marketing landing page)
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "hero.png") });
  await revealPage(page);
  await page.screenshot({ path: path.join(OUT, "home.png"), fullPage: true });

  // Login
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "login.png") });

  // Register
  await page.goto(BASE + "/register", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "register.png") });

  // Log in as admin for the authenticated screens
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.fill('#email', "admin@stms.dev");
  await page.fill('#password', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, "dashboard.png"), fullPage: true });

  // Tournaments list
  await page.goto(BASE + "/tournaments", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, "tournaments.png"), fullPage: true });

  // Knockout bracket view
  const knockoutCard = page.getByText("Regional Cup 2026").first();
  if (await knockoutCard.count()) {
    await knockoutCard.click();
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Bracket" }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, "tournament-bracket.png"), fullPage: true });
  }

  // League standings view
  await page.goto(BASE + "/tournaments", { waitUntil: "networkidle" });
  const leagueCard = page.getByText("City League 2026").first();
  if (await leagueCard.count()) {
    await leagueCard.click();
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Table" }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, "tournament-league.png"), fullPage: true });
  }

  // Teams list
  await page.goto(BASE + "/teams", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, "teams.png"), fullPage: true });

  await browser.close();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { chromium } from "playwright-core";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const frontendDirectory = resolve(scriptDirectory, "..");
const projectDirectory = resolve(frontendDirectory, "..");
const screenshotDirectory = resolve(projectDirectory, "docs", "screenshots");
const appUrl = (process.env.APP_URL || "http://127.0.0.1:5173").replace(/\/$/, "");
const useMockApi = process.env.QA_MOCK_API === "1";
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const qaUser = {
  fullname: "Memora QA",
  username: `memoraqa${runId.replace(/\D/g, "").slice(-10)}`,
  email: `memora.qa.${runId}@example.test`,
  password: `Memora!${runId.slice(-8)}Aa`,
};

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);

const executablePath = chromeCandidates.find((candidate) => existsSync(candidate));
if (!executablePath) {
  throw new Error("Chrome or Edge was not found. Set CHROME_PATH to a Chromium-based browser executable.");
}

const report = {
  appUrl,
  mode: useMockApi ? "mock-api" : "live-api",
  generatedAt: new Date().toISOString(),
  screenshots: [],
  checks: [],
  consoleErrors: [],
  failedRequests: [],
};

const qaApiState = {
  user: { _id: "qa-user", fullname: qaUser.fullname, username: qaUser.username, email: qaUser.email, bio: "" },
  diaries: [],
  capsules: [],
  moods: [],
};

const pause = (milliseconds) => new Promise((resolvePause) => setTimeout(resolvePause, milliseconds));

const routeJson = (route, payload, status = 200) => route.fulfill({
  status,
  contentType: "application/json",
  headers: {
    "access-control-allow-origin": appUrl,
    "access-control-allow-credentials": "true",
  },
  body: JSON.stringify(payload),
});

const readRequestJson = (request) => {
  try {
    return request.postDataJSON() || {};
  } catch {
    return {};
  }
};

const mockApi = async (route) => {
  const request = route.request();
  const method = request.method();
  const path = new URL(request.url()).pathname;
  const body = readRequestJson(request);

  if (method === "OPTIONS") return route.fulfill({ status: 204 });
  if (path.endsWith("/csrf-token")) return routeJson(route, { csrfToken: "qa-csrf-token" });
  if (path.endsWith("/auth/register") && method === "POST") return routeJson(route, { message: "User registered successfully" }, 201);
  if (path.endsWith("/auth/login") && method === "POST") return routeJson(route, { message: "Login successful" });
  if (path.endsWith("/auth/profile") && method === "GET") return routeJson(route, { user: qaApiState.user });
  if (path.endsWith("/auth/details") && method === "GET") return routeJson(route, { user: qaApiState.user });
  if (path.endsWith("/auth/profile") && method === "PATCH") {
    qaApiState.user = { ...qaApiState.user, ...body };
    return routeJson(route, { user: qaApiState.user });
  }

  if (path.endsWith("/diary-entries/create-diary") && method === "POST") {
    const diary = {
      _id: `diary-${qaApiState.diaries.length + 1}`,
      title: body.title,
      content: body.entryText || "",
      date: body.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      emotionTag: body.emotionTag || null,
      isSecret: Boolean(body.isSecret),
      photos: null,
    };
    qaApiState.diaries.unshift(diary);
    return routeJson(route, { success: true, data: diary, streak: { currentStreak: 1, longestStreak: 1, totalEntries: qaApiState.diaries.length } }, 201);
  }
  if (path.endsWith("/diary-entries/all-diary")) return routeJson(route, { success: true, data: qaApiState.diaries, pagination: { total: qaApiState.diaries.length, page: 1, pages: 1 } });
  if (path.endsWith("/diary-entries/streak")) return routeJson(route, { success: true, data: { currentStreak: qaApiState.diaries.length ? 1 : 0, longestStreak: 1, totalEntries: qaApiState.diaries.length, lastEntryDate: qaApiState.diaries.length ? new Date().toISOString() : null } });
  if (path.endsWith("/diary-entries/on-this-day")) return routeJson(route, { success: true, data: [] });

  if (path.endsWith("/photo-memories/get-all-photo")) return routeJson(route, { success: true, data: [] });
  if (path.endsWith("/photo-memories/create-photo-album") && method === "POST") return routeJson(route, { success: true, data: { _id: "album-1", ...body, createdAt: new Date().toISOString() } }, 201);

  if (path.endsWith("/capsules/create-capsule") && method === "POST") {
    const capsule = {
      _id: `capsule-${qaApiState.capsules.length + 1}`,
      title: body.title,
      message: body.message,
      sendDate: body.sendDate,
      lockUntilSend: Boolean(body.lockUntilSend),
      status: body.lockUntilSend ? "Locked" : "Pending",
      capsuleType: body.capsuleType || "private",
      category: body.category || "Personal",
      tags: body.tags || [],
      coverImage: body.coverImage || null,
      createdAt: new Date().toISOString(),
    };
    qaApiState.capsules.unshift(capsule);
    return routeJson(route, { success: true, message: "Capsule created successfully!", data: capsule }, 201);
  }
  if (path.endsWith("/capsules/all-capsules")) return routeJson(route, { success: true, capsules: qaApiState.capsules, pagination: { total: qaApiState.capsules.length, page: 1, pages: 1 } });

  if (path.endsWith("/mood/week")) return routeJson(route, qaApiState.moods);
  if (path.endsWith("/mood/today")) return routeJson(route, { exists: false });
  if (path.endsWith("/mood") && method === "POST") {
    qaApiState.moods = [{ day: new Date().toISOString().slice(0, 10), mood: body.mood }];
    return routeJson(route, { message: "Mood saved", mood: qaApiState.moods[0] });
  }

  if (path.includes("/friends")) return routeJson(route, { friends: [], received: [], sent: [] });
  if (path.endsWith("/users")) return routeJson(route, { users: [] });
  if (path.includes("/messages")) return routeJson(route, []);
  return routeJson(route, { success: true, data: [] });
};

const prepareContext = async (context) => {
  if (!useMockApi) return;
  await context.route("**/api/**", mockApi);
  await context.route("**/socket.io/**", (route) => route.abort());
};

const saveReport = async () => {
  await writeFile(resolve(screenshotDirectory, "qa-report.json"), `${JSON.stringify(report, null, 2)}\n`);
};

const capture = async (page, name, options = {}) => {
  await page.evaluate(() => document.fonts?.ready);
  // A full-page image does not scroll through sections, so IntersectionObserver
  // animations would leave off-screen content hidden in documentation captures.
  await page.evaluate(() => document.querySelector(".memora-home")?.removeAttribute("data-motion-ready"));
  await pause(250);
  const filename = `${name}.png`;
  await page.screenshot({ path: resolve(screenshotDirectory, filename), fullPage: true, ...options });
  report.screenshots.push(filename);
};

const expectVisible = async (page, locator, label, timeout = 12_000) => {
  await locator.waitFor({ state: "visible", timeout });
  report.checks.push({ label, status: "passed" });
};

const optionalClick = async (page, locator) => {
  if (await locator.count() === 0) return false;
  const first = locator.first();
  if (!(await first.isVisible().catch(() => false))) return false;
  await first.click();
  return true;
};

const openProtectedRoute = async (page, path, name) => {
  await page.goto(`${appUrl}${path}`, { waitUntil: "domcontentloaded" });
  await pause(1_000);
  if (new URL(page.url()).pathname === "/login") {
    throw new Error(`${path} redirected to login after the test account was created.`);
  }
  await capture(page, name);
};

const createDiary = async (page) => {
  const memoryButton = page.getByRole("button", { name: /^Memory$/ });
  if (!(await optionalClick(page, memoryButton))) return;

  const diaryChoice = page.getByRole("button", { name: /Diary entry/i });
  if (!(await optionalClick(page, diaryChoice))) return;

  await expectVisible(page, page.getByPlaceholder("Title your memory…"), "Diary entry form opens");
  await page.getByPlaceholder("Title your memory…").fill("A small QA memory");
  await page.getByPlaceholder(/Dear diary/).fill("A disposable entry created by the visual QA script.");
  await capture(page, "diary-entry-form");
  await page.getByRole("button", { name: /Save Entry/i }).click();
  await pause(1_500);
  await capture(page, "dashboard-with-diary");
  report.checks.push({ label: "Diary entry can be created", status: "passed" });
};

const createCapsule = async (page) => {
  const capsuleButton = page.getByRole("button", { name: /^Capsule$/ });
  if (!(await optionalClick(page, capsuleButton))) return;

  const title = page.getByPlaceholder("Give it a sweet title...");
  await expectVisible(page, title, "Capsule creation flow opens");
  await title.fill("A note for tomorrow");
  await page.getByPlaceholder(/Write from the heart/).fill("A disposable capsule made by the visual QA script.");
  await capture(page, "capsule-basics");

  await page.getByRole("button", { name: /^Next$/ }).click();
  await page.getByRole("button", { name: /^Next$/ }).click();
  await expectVisible(page, page.locator('input[type="datetime-local"]'), "Capsule schedule step opens");
  await page.locator('input[type="datetime-local"]').fill("2030-01-01T12:00");
  await capture(page, "capsule-schedule");

  await page.getByRole("button", { name: /^Next$/ }).click();
  await page.getByRole("button", { name: /Seal Capsule/i }).click();
  await pause(1_500);
  report.checks.push({ label: "Time capsule can be created", status: "passed" });
};

await mkdir(screenshotDirectory, { recursive: true });

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--disable-gpu", "--force-color-profile=srgb"],
});

try {
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await prepareContext(desktopContext);
  const page = await desktopContext.newPage();

  page.on("pageerror", (error) => report.consoleErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") report.consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    if (!request.url().includes("socket.io")) report.failedRequests.push({ url: request.url(), error: request.failure()?.errorText || "request failed" });
  });

  await page.goto(appUrl, { waitUntil: "domcontentloaded" });
  await expectVisible(page, page.getByRole("heading", { name: /Keep your memories/i }), "Home page renders");
  await capture(page, "home-desktop");

  const mobileHomeContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true });
  await prepareContext(mobileHomeContext);
  const mobileHome = await mobileHomeContext.newPage();
  await mobileHome.goto(appUrl, { waitUntil: "domcontentloaded" });
  await expectVisible(mobileHome, mobileHome.getByRole("heading", { name: /Keep your memories/i }), "Home page renders on a phone viewport");
  await capture(mobileHome, "home-mobile");
  await mobileHomeContext.close();

  await page.goto(`${appUrl}/register`, { waitUntil: "domcontentloaded" });
  await expectVisible(page, page.getByRole("heading", { name: /Create your account/i }), "Registration page renders");
  await capture(page, "register");

  await page.locator("#fullname").fill(qaUser.fullname);
  await page.locator("#username").fill(qaUser.username);
  await page.locator("#email").fill(qaUser.email);
  await page.locator("#password").fill(qaUser.password);
  await page.getByRole("button", { name: /Create account/i }).click();

  try {
    await page.waitForURL(/\/dashboard$/, { timeout: 15_000 });
  } catch {
    const registrationError = page.locator(".bg-pink-50.border-pink-200").first();
    const detail = await registrationError.textContent().catch(() => "No response received");
    throw new Error(`Registration failed: ${detail?.trim() || "No response received"}`);
  }

  await expectVisible(page, page.getByRole("heading", { name: /Good (morning|afternoon|evening)/i }), "New account reaches the dashboard");
  await capture(page, "dashboard");

  await createDiary(page);
  await createCapsule(page);

  await openProtectedRoute(page, "/memories", "memories");
  await expectVisible(page, page.getByText(/A small QA memory/i), "Created diary appears in memories");

  await openProtectedRoute(page, "/capsules", "capsules");
  await expectVisible(page, page.getByText(/A note for tomorrow/i), "Created capsule appears in capsules");

  await openProtectedRoute(page, "/friends", "friends");
  await openProtectedRoute(page, "/profile", "profile");

  const storageState = await desktopContext.storageState();
  const mobileDashboardContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, storageState });
  await prepareContext(mobileDashboardContext);
  const mobileDashboard = await mobileDashboardContext.newPage();
  await mobileDashboard.goto(`${appUrl}/dashboard`, { waitUntil: "domcontentloaded" });
  await expectVisible(mobileDashboard, mobileDashboard.getByRole("heading", { name: /Good (morning|afternoon|evening)/i }), "Dashboard renders on a phone viewport");
  await capture(mobileDashboard, "dashboard-mobile");
  await mobileDashboardContext.close();

  report.status = "passed";
  report.testAccount = { username: qaUser.username, email: qaUser.email };
  console.log(`Screenshot QA completed. Account: ${qaUser.username}`);
} catch (error) {
  report.status = "failed";
  report.error = error instanceof Error ? error.message : String(error);
  console.error(report.error);
  process.exitCode = 1;
} finally {
  await saveReport();
  await browser.close();
}

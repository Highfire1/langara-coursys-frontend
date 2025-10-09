/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Optional parameters for customization
  const width = parseInt(searchParams.get("width") || "720");
  const height = parseInt(searchParams.get("height") || "480");
  
  // Support planner-specific parameters
  const year = searchParams.get("y");
  const term = searchParams.get("t");
  const crns = searchParams.get("crns");

  let browser;
  try {
    const isVercel = !!process.env.VERCEL_ENV;
    let puppeteer: any,
      launchOptions: any = {
        headless: true,
      };

    if (isVercel) {
      const chromium = (await import("@sparticuz/chromium")).default;
      puppeteer = await import("puppeteer-core");
      launchOptions = {
        ...launchOptions,
        args: [
          ...chromium.args,
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-dev-shm-usage',
        ],
        executablePath: await chromium.executablePath(),
      };
    } else {
      puppeteer = await import("puppeteer");
      launchOptions = {
        ...launchOptions,
        args: [
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-dev-shm-usage',
        ],
      };
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width, height });

    // Build the URL for the planner page with screenshot mode
    const baseUrl = isVercel 
      ? `https://${request.headers.get('host')}`
      : 'http://localhost:3000';
    
    let plannerUrl = `${baseUrl}/planner?view=screenshot`;
    
    // Add year, term, and crns if provided (for specific schedules)
    if (year) plannerUrl += `&y=${year}`;
    if (term) plannerUrl += `&t=${term}`;
    if (crns) plannerUrl += `&crns=${crns}`;

    console.log('Navigating to:', plannerUrl);

    // Navigate to the planner page with a faster wait strategy
    await page.goto(plannerUrl, { 
      waitUntil: "domcontentloaded", // Changed from "networkidle2" for speed
      timeout: 20000 
    });

    // Wait for the calendar to fully render AND have events loaded
    // Check for FullCalendar events (courses) rather than just the calendar container
    await page.waitForFunction(
      () => {
        const events = document.querySelectorAll('.fc-event');
        return events.length > 0;
      },
      { timeout: 8000 }
    ).catch(() => {
      console.log('No calendar events found, taking screenshot anyway...');
    });

    // Small delay to ensure everything is painted
    await new Promise(resolve => setTimeout(resolve, 300));

    // Take the screenshot
    const screenshot = await page.screenshot({ 
      type: "png",
      fullPage: false
    });

    return new NextResponse(screenshot, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="planner-screenshot.png"',
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  } catch (error) {
    console.error("Screenshot error:", error);
    return new NextResponse(
      `An error occurred while generating the screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

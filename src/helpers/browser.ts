import puppeteer from "puppeteer";

export async function getPageContent(uri: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(uri);
  const content = await page.evaluate(() => {
    const title = document.title;
    const description = document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content");
    const body = document.body.innerText;
    return { title, description, body };
  });
  await browser.close();
  return content;
}

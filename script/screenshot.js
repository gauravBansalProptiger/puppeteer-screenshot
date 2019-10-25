/**
 * @name screenshots
 *
 * @desc Snaps a basic screenshot of the full Housing.com  homepage and saves it a .png file.
 *
 * @see {@link https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#screenshot}
 *
 * @name Screenshots parallel pages in batches
 *
 * @desc parallel screenshotting of an array of Websites with small example
 */


const puppeteer = require('puppeteer')
const parallel = 4;

const urls = [
  { name: 'IREO-3BHK', url: 'https://beta-digitour.housing.com/projects/ireo/3bhk' },
  { name: 'IREO-2BHK', url: 'https://beta-digitour.housing.com/projects/ireo/3bhk' }
]

const screenshotUrls = async (urls, parallel) => {
  const parallelBatches = Math.ceil(urls.length / parallel)

  console.log('\nI have gotten the task of taking screenshots of ' + urls.length + ' DigiTour and will take ' + parallel + ' of them in paralell.')

  console.log(' This will result in ' + parallelBatches + ' batches.')

  // Split up the Array of colleges
  let k = 0
  for (let i = 0; i < urls.length; i += parallel) {
    k++
    console.log('\nBatch ' + k + ' of ' + parallelBatches)
    // Launch and Setup Chromium
    const browser = await puppeteer.launch();
    // Fun with puppeteer
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    // page.setJavaScriptEnabled(false)

    const promises = []
    for (let j = 0; j < parallel; j++) {
      let elem = i + j
      // only proceed if there is an element
      if (urls[elem] != undefined) {
        // Promise to take Screenshots
        // promises push
        console.log('🖖 I promise to screenshot: ' + urls[elem].name)
        promises.push(browser.newPage().then(async page => {
          await page.setViewport({ width: 1280, height: 800 })
          try {
            // Only create screenshot if page.goto get's no error
            console.log('URL: ', urls[elem].url);
            await page.goto(urls[elem].url)
            try {
              await page.waitForFunction(
                'document.querySelector("#loading-percent__value") !== null', { timeout: 300000 }
              );
            } catch (e) {
              console.log('Some error ', e)
            }
            await page.waitForFunction(
              'document.querySelector("#loading-percent__value").innerText.includes("100")', { timeout: 300000 }
            );
            await page.evaluate(() => { document.querySelector('.ui-elements').style.display = 'none' });
            await page.screenshot({ path: "screens/" + urls[elem].name + '.png', fullPage: true }).then(console.log('🤞 I have kept my promise to screenshot ' + urls[elem].name))

          } catch (err) {
            console.log('❌ Sorry! I couldn\'t keep my promise to screenshot ' + urls[elem].name, err)
          }
        }))
      }
    }

    // await promise all and close browser
    await Promise.all(promises)
    await browser.close()

    console.log('\nI finished this batch. I\'m ready for the next batch');
  }
}

// screenshotUrls(urls, parallel)
module.exports = {
  screenshotUrls
}
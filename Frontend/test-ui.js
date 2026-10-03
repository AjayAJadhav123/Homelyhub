const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.type('#email_field', 'test@test.com');
    await page.type('#password_field', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(e => console.log('nav 1 timeout'));
    
    await page.goto('http://localhost:5173/editprofile', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#avatarupdate');
    
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('.custom-file-label')
    ]);
    await fileChooser.accept(['../sample.jpg']);
    
    const previewSrc = await page.\('.rounded-circle', el => el.src);
    console.log('Preview SRC:', previewSrc.substring(0, 50) + '...');
    
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Current URL:', page.url());
    
    await page.waitForSelector('.avatar-profile img');
    const profileSrc = await page.\('.avatar-profile img', el => el.src);
    console.log('Profile SRC:', profileSrc.substring(0, 50) + '...');
    
  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();

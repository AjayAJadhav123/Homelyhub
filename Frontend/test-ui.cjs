const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // sign up first just in case
    await page.goto('http://localhost:5173/signup', { waitUntil: 'networkidle2' });
    await page.type('#name_field', 'Test User');
    await page.type('#email_field', 'testuser' + Date.now() + '@example.com');
    await page.type('#phoneNumber_field', '123123' + Date.now().toString().slice(8));
    await page.type('#password_field', 'password123');
    await page.type('#passwordConfirm_field', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(e => console.log('nav signup timeout'));

    await page.goto('http://localhost:5173/editprofile', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#avatarupdate');
    
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.evaluate(() => document.querySelector('.custom-file-label').click())
    ]);
    await fileChooser.accept(['../sample.jpg']);
    
    const previewSrc = await page.evaluate(() => document.querySelector('.rounded-circle').src);
    console.log('Preview SRC:', previewSrc.substring(0, 50) + '...');
    
    await page.evaluate(() => document.querySelector('button[type="submit"]').click());
    
    // Wait for a few seconds for API and navigation
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Current URL:', page.url());
    
    await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.avatar-profile img');
    const profileSrc = await page.evaluate(() => document.querySelector('.avatar-profile img').src);
    console.log('Profile SRC:', profileSrc.substring(0, 50) + '...');
    
  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();

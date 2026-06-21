const { test, expect } = require('@playwright/test');

test.describe('Booking Form', () => {
  test('should successfully submit the booking form', async ({ page }) => {
    // 1. Mock the Supabase API call to prevent spamming the real database during tests
    await page.route('https://cwdtpdtwklkwxltuhegz.supabase.co/rest/v1/reservation', async route => {
      // Mock a successful insert response from Supabase
      const json = [{ id: 'mock-id' }];
      await route.fulfill({ json });
    });

    // 2. Open the local HTML file
    // Using file:// protocol to test the local file without needing a web server
    const fileUrl = `file://${process.cwd()}/index.html`;
    await page.goto(fileUrl);

    // 3. Fill out the form
    // Set a date for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    
    await page.fill('#date', formattedDate);
    await page.selectOption('#time', { label: '10:00 - 11:30 น.' });
    await page.selectOption('#guests', { label: '2 ท่าน' });
    await page.fill('#name', 'สมชาย ทดสอบ');
    await page.fill('#phone', '0812345678');
    await page.fill('#note', 'ทดสอบการจองจาก Playwright');

    // 4. Submit the form
    await page.click('button[type="submit"]');

    // 5. Verify the success message appears
    const successMsg = page.locator('#successMessage');
    await expect(successMsg).toBeVisible();

    // Verify it contains the text "การจองสำเร็จ!"
    await expect(successMsg).toContainText('การจองสำเร็จ!');
    
    // Verify reference code is displayed
    const refCode = page.locator('#refCode');
    await expect(refCode).not.toBeEmpty();
  });

  test('should show error when Supabase API fails', async ({ page }) => {
    // 1. Mock the Supabase API call to simulate an error
    await page.route('https://cwdtpdtwklkwxltuhegz.supabase.co/rest/v1/reservation', async route => {
      await route.fulfill({
        status: 500,
        json: { error: 'Internal Server Error' }
      });
    });

    // 2. Open the local HTML file
    const fileUrl = `file://${process.cwd()}/index.html`;
    await page.goto(fileUrl);

    // 3. Fill out the form
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#date', today);
    await page.selectOption('#time', { label: '13:00 - 14:30 น.' });
    await page.selectOption('#guests', { label: '1 ท่าน' });
    await page.fill('#name', 'สมหญิง ผิดพลาด');
    await page.fill('#phone', '0898765432');

    // 4. Submit the form
    await page.click('button[type="submit"]');

    // 5. Verify the error message appears
    const errorMsg = page.locator('#errorMessage');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    
    // Success message should NOT be visible
    const successMsg = page.locator('#successMessage');
    await expect(successMsg).toBeHidden();
  });
});

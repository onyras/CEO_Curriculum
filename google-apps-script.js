// ============================================
// GOOGLE APPS SCRIPT - CEO Curriculum Submissions
// ============================================
//
// SETUP INSTRUCTIONS:
// 1. Create a new Google Sheet
// 2. Go to Extensions → Apps Script
// 3. Delete any code in the editor
// 4. Paste this entire file
// 5. Click "Deploy" → "New deployment"
// 6. Select type: "Web app"
// 7. Set "Execute as": Me
// 8. Set "Who has access": Anyone
// 9. Click "Deploy" and authorize
// 10. Copy the Web app URL
// 11. Paste it in curriculum.js (GOOGLE_SCRIPT_URL)
// ============================================

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Name',
        'Email',
        'Total Modules',
        'Leading Yourself',
        'Leading Teams',
        'Leading Organizations',
        'Resources',
        'Full Details'
      ]);

      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#A6BEA4');
    }

    // Format selections by domain
    const yourself = data.selections.yourself.map(m => m.title).join(', ') || '-';
    const teams = data.selections.teams.map(m => m.title).join(', ') || '-';
    const organizations = data.selections.organizations.map(m => m.title).join(', ') || '-';
    const resources = data.selections.resources.map(m => m.title).join(', ') || '-';

    // Count total
    const total = data.selections.yourself.length +
                  data.selections.teams.length +
                  data.selections.organizations.length +
                  data.selections.resources.length;

    // Append row
    sheet.appendRow([
      new Date().toLocaleString(),
      data.clientName,
      data.clientEmail,
      total,
      yourself,
      teams,
      organizations,
      resources,
      data.curriculum
    ]);

    // Auto-resize columns
    sheet.autoResizeColumns(1, 9);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required for CORS
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'OK', message: 'CEO Curriculum API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

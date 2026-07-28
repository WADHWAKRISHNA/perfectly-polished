/**
 * Perfectly Polished — Google Sheets backend
 * Paste this whole file into Extensions > Apps Script in your Google Sheet.
 * See README.md in the project for full setup steps.
 *
 * Expects a Google Sheet with two tabs:
 *   "Products" with header row: id | imageUrl | title | description | price | dateAdded
 *   "Contacts" with header row: dateSubmitted | name | email | message | productRef
 */

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'getProducts') {
    const sheet = ss.getSheetByName('Products');
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1)
      .filter(r => r[1]) // must have an image url
      .map(r => ({
        id: r[0],
        imageUrl: r[1],
        title: r[2],
        description: r[3],
        price: r[4],
        dateAdded: r[5],
      }));
    return jsonOutput(rows);
  }

  return jsonOutput({ error: 'Unknown action' });
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = JSON.parse(e.postData.contents);

  if (data.action === 'addProduct') {
    const sheet = ss.getSheetByName('Products');
    sheet.appendRow([
      Utilities.getUuid(),
      data.imageUrl || '',
      data.title || '',
      data.description || '',
      data.price || '',
      new Date(),
    ]);
    return jsonOutput({ success: true });
  }

  if (data.action === 'addContact') {
    const sheet = ss.getSheetByName('Contacts');
    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.message || '',
      data.productRef || '',
    ]);
    return jsonOutput({ success: true });
  }

  return jsonOutput({ error: 'Unknown action' });
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

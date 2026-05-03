// Append form rows to your Sheet. Paste ALL of this into Apps Script (Code.gs).
//
// 1) Open the spreadsheet, Extensions -> Apps Script, delete default code, paste this.
// 2) Optional: Project Settings -> Script properties -> WEBHOOK_SECRET = random long string
//    (same value as GOOGLE_APPS_SCRIPT_SECRET in apps/web/.env)
// 3) Save, Deploy -> New deployment -> Web app -> Execute as Me, Who has access: Anyone
// 4) Authorize. Copy the /exec URL into GOOGLE_SHEETS_APPS_SCRIPT_URL in .env

var SHEET_ID = '1RzHZ-JHgnQQ09EQOrAF7_1KIicqwxxcFryJ2ScyujYk';

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut({ ok: false, error: 'invalid_json' });
  }

  var expected = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (expected && body.webhookSecret !== expected) {
    return jsonOut({ ok: false, error: 'unauthorized' });
  }

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheets()[0];

  sheet.appendRow([
    new Date(),
    String(body.name || ''),
    String(body.email || ''),
    String(body.phone || ''),
    String(body.company || ''),
    String(body.message || '')
  ]);

  return jsonOut({ ok: true });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

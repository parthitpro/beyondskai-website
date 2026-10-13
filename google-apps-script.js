/**
 * Beyond Skai - Google Sheets Database & Lead Webhook
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheet.new)
 * 2. Name the sheet: "Beyond Skai Leads"
 * 3. Go to Extensions > Apps Script
 * 4. Replace everything in Code.gs with this code.
 * 5. Click "Deploy" > "New deployment"
 * 6. Select type: "Web app"
 * 7. Set:
 *    - Description: "Beyond Skai Leads API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (IMPORTANT!)
 * 8. Click "Deploy", Authorize access, and copy the "Web app URL".
 * 9. Paste the Web app URL in your Beyond Skai Admin Panel (https://www.beyondskai.com/admin)
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create luxury headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Lead ID",
        "Timestamp",
        "Service",
        "Name",
        "Phone / WhatsApp",
        "Destination / Route",
        "Travel / Check-in Date",
        "Additional Details",
        "Source Page",
        "Status"
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 10);
      headerRange.setFontWeight("bold")
                 .setBackground("#0f172a")
                 .setFontColor("#ffffff")
                 .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var leadId = data.id || "BS-" + Utilities.formatDate(new Date(), "Asia/Kolkata", "yyMMdd-HHmmss");
    var timestamp = data.timestamp || Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
    var service = data.service || data.service_type || "General Enquiry";
    var name = data.name || "Guest";
    var phone = data.phone || data.whatsapp || "";
    var destination = data.destination || data.country || data.currency || "";
    var date = data.date || data.checkin || data.travel_date || "";
    var details = data.details || data.message || "";
    var page = data.page || "";
    var status = data.status || "New";

    sheet.appendRow([
      leadId,
      timestamp,
      service,
      name,
      "'" + phone, // prepend apostrophe so leading 0 isn't stripped by Excel/Sheets
      destination,
      date,
      details,
      page,
      status
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead recorded successfully",
      leadId: leadId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      data.push({
        id: r[0] || ("BS-" + i),
        timestamp: r[1],
        service: r[2],
        name: r[3],
        phone: String(r[4]).replace(/^'/, ""),
        destination: r[5],
        date: r[6],
        details: r[7],
        page: r[8],
        status: r[9] || "New"
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: data
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Portfolio contact form: backend for the "Let's work together" form.
 *
 * Every message is saved to the "Enquiries" sheet first (so nothing is ever
 * lost), then emailed to you with Reply-To set to the client, and the client
 * gets a short confirmation. Runs free on your Google account; no third party.
 *
 * Run `setup` once from the editor to create the sheet and approve
 * Sheets + Gmail access. Redeploy with `clasp push` then
 * `clasp deploy -i <deployment id>` so the web-app URL never changes.
 */

const CONFIG = {
  SHEET_NAME: 'Enquiries',
  SPREADSHEET_TITLE: 'Portfolio enquiries',
  NOTIFY_TO: 'syed.designuiux@gmail.com',  // where new messages are sent
  OWNER_NAME: 'Syed Mudaseer',
  AUTO_REPLY: true,                         // send the client a "got it" email
  MAX_NAME: 100,
  MAX_EMAIL: 150,
  MAX_MESSAGE: 5000,
  SAME_EMAIL_COOLDOWN_S: 60,                // one message per address per minute
  MAX_PER_HOUR: 30,                         // emails per hour; messages past this are still saved
};

/** Health check: open the /exec URL in a browser to see {"ok":true}. */
function doGet() {
  return json_({ ok: true, service: 'portfolio-contact' });
}

function doPost(e) {
  // The page sends JSON as text/plain; a plain HTML form post (no JS) arrives as e.parameter.
  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    body = (e && e.parameter) || null;
  }
  if (!body || typeof body !== 'object') return json_({ ok: false, error: 'bad_request' });

  // Honeypot: real people never fill this hidden field. Pretend success to bots.
  if (body._honey) return json_({ ok: true });

  const name = clean_(body.name, CONFIG.MAX_NAME);
  const email = clean_(body.email, CONFIG.MAX_EMAIL).toLowerCase();
  const message = clean_(body.message, CONFIG.MAX_MESSAGE, true);
  const page = clean_(body.page, 300);

  if (!name) return json_({ ok: false, error: 'invalid_name' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json_({ ok: false, error: 'invalid_email' });
  if (!message) return json_({ ok: false, error: 'invalid_message' });

  const cache = CacheService.getScriptCache();
  if (cache.get('sent:' + email)) return json_({ ok: false, error: 'too_soon' });
  const hourKey = 'hour:' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHH');

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return json_({ ok: false, error: 'busy' });
  }
  // Always save, even in a flood, so spam can't push out a real enquiry.
  // The hourly cap only limits email, which protects the daily mail quota.
  let sendMail;
  try {
    sheet_().appendRow([new Date(), name, email, message, page, 'new']);
    SpreadsheetApp.flush();
    cache.put('sent:' + email, '1', CONFIG.SAME_EMAIL_COOLDOWN_S);
    const sentThisHour = Number(cache.get(hourKey) || 0);
    sendMail = sentThisHour < CONFIG.MAX_PER_HOUR;
    cache.put(hourKey, String(sentThisHour + 1), 3600);
  } finally {
    lock.releaseLock();
  }

  // The message is already saved; a mail hiccup must not turn into an error for the client.
  if (sendMail) {
    try { notifyOwner_(name, email, message, page); } catch (err) { console.error(err); }
    if (CONFIG.AUTO_REPLY) {
      try { autoReply_(email); } catch (err) { console.error(err); }
    }
  }

  return json_({ ok: true });
}

function notifyOwner_(name, email, message, page) {
  MailApp.sendEmail({
    to: CONFIG.NOTIFY_TO,
    replyTo: email,
    name: 'Portfolio contact form',
    subject: 'New enquiry from ' + name,
    body: [
      'New message from your portfolio.',
      '',
      'Name: ' + name,
      'Email: ' + email,
      '',
      message,
      '',
      '---',
      'Hit Reply to answer ' + name + ' directly.',
      'All enquiries: ' + ss_().getUrl(),
      page ? 'Sent from: ' + page : '',
    ].join('\n'),
  });
}

/**
 * Fixed text only. The address is whatever the visitor typed, so echoing their
 * name or message would let anyone send their own text from this account.
 */
function autoReply_(email) {
  MailApp.sendEmail({
    to: email,
    replyTo: CONFIG.NOTIFY_TO,
    name: CONFIG.OWNER_NAME,
    subject: 'Thanks for your message',
    body: [
      'Hi,',
      '',
      'Thanks for reaching out. Your message reached me and I will reply within 24 hours.',
      '',
      'If you need to add anything, just reply to this email.',
      '',
      CONFIG.OWNER_NAME,
    ].join('\n'),
  });
}

/** Trim, drop control characters, cap length. Keeps line breaks for messages. */
function clean_(value, max, multiline) {
  let s = String(value == null ? '' : value);
  s = multiline ? s.replace(/[^\S\n]+/g, ' ') : s.replace(/\s+/g, ' ');
  s = s.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim();
  // A leading = + - @ would run as a formula in Sheets.
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s.slice(0, max);
}

/** The Sheet this script owns, created on first run. */
function ss_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const created = SpreadsheetApp.create(CONFIG.SPREADSHEET_TITLE);
  props.setProperty('SHEET_ID', created.getId());
  return created;
}

function sheet_() {
  const ss = ss_();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName(CONFIG.SHEET_NAME);
    sheet.appendRow(['Received', 'Name', 'Email', 'Message', 'Page', 'Status']);
    sheet.setFrozenRows(1);
    sheet.getRange('A1:F1').setFontWeight('bold');
    sheet.setColumnWidth(4, 420);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor: creates the sheet and approves Sheets + Gmail access. */
function setup() {
  sheet_();
  MailApp.getRemainingDailyQuota();
  console.log('Ready. Enquiries sheet: ' + ss_().getUrl());
}

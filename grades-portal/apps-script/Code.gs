/**
 * Physiology Grades — backend (Google Apps Script bound to a Google Sheet).
 * Sheets are created automatically: Students, Exams, Grades.
 * Deploy: Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 */
const SH = { students: ['Name', 'Neptun', 'Password'], exams: ['ID', 'Title', 'Date'], grades: ['ExamID', 'Neptun', 'Grade'] };
const NAMES = { students: 'Students', exams: 'Exams', grades: 'Grades' };

function doGet() {
  return ContentService.createTextOutput('Grades API is running.');
}

function doPost(e) {
  let out;
  try {
    const req = JSON.parse(e.postData.contents);
    out = { ok: true, data: route(req) };
  } catch (err) {
    out = { ok: false, error: String(err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function route(r) {
  switch (r.action) {
    case 'student': return studentGrades(r.neptun, r.password);
    case 'login': requireAdmin(r.pw); return true;
    case 'data': requireAdmin(r.pw); return adminData();
    case 'upsertStudents': requireAdmin(r.pw); return locked(() => upsertStudents(r.rows));
    case 'deleteStudent': requireAdmin(r.pw); return locked(() => deleteStudent(r.neptun));
    case 'saveExam': requireAdmin(r.pw); return locked(() => saveExam(r.title, r.date, r.grades));
    case 'deleteExam': requireAdmin(r.pw); return locked(() => deleteExam(r.id));
    case 'changePassword': requireAdmin(r.pw); return setAdmin(r.newPw);
    default: throw new Error('Unknown action');
  }
}

// ---------- helpers ----------
function sheet(key) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(NAMES[key]);
  if (!s) {
    s = ss.insertSheet(NAMES[key]);
    s.appendRow(SH[key]);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, SH[key].length).setFontWeight('bold');
    s.getRange('A:Z').setNumberFormat('@'); // keep codes/dates as plain text
  }
  return s;
}
function rows(key) {
  const v = sheet(key).getDataRange().getDisplayValues();
  return v.slice(1).filter(r => r.join('') !== '');
}
function locked(fn) {
  const l = LockService.getScriptLock();
  l.waitLock(20000);
  try { return fn(); } finally { l.releaseLock(); }
}
const up = s => String(s || '').trim().toUpperCase();
function hash(s) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'gp:' + s));
}
function newPin() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let p = '';
  for (let i = 0; i < 6; i++) p += c[Math.floor(Math.random() * c.length)];
  return p;
}

// ---------- lecturer auth (first password ever used becomes the lecturer password) ----------
function requireAdmin(pw) {
  const props = PropertiesService.getScriptProperties();
  const h = props.getProperty('ADMIN_HASH');
  if (!h) { setAdmin(pw); return; }
  if (hash(pw || '') !== h) { Utilities.sleep(800); throw new Error('Wrong lecturer password'); }
}
function setAdmin(pw) {
  if (!pw || String(pw).length < 6) throw new Error('Password must be at least 6 characters');
  PropertiesService.getScriptProperties().setProperty('ADMIN_HASH', hash(pw));
  return true;
}

// ---------- actions ----------
function adminData() {
  return {
    students: rows('students').map(r => ({ name: r[0], neptun: up(r[1]), pin: r[2] }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    exams: rows('exams').map(r => ({ id: r[0], title: r[1], date: r[2] }))
      .sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id)),
    grades: rows('grades').map(r => ({ examId: r[0], neptun: up(r[1]), grade: r[2] }))
  };
}

function upsertStudents(list) {
  const s = sheet('students');
  const data = s.getDataRange().getValues();
  const idx = {};
  data.forEach((r, i) => { if (i) idx[up(r[1])] = i + 1; });
  const add = [];
  (list || []).forEach(x => {
    const n = up(x.neptun), name = String(x.name || '').trim();
    if (!n) return;
    if (idx[n]) s.getRange(idx[n], 1).setValue(name);
    else { add.push([name, n, newPin()]); idx[n] = -1; }
  });
  if (add.length) s.getRange(s.getLastRow() + 1, 1, add.length, 3).setValues(add);
  return add.length;
}

function deleteRowsWhere(key, col, val) {
  const s = sheet(key);
  const v = s.getDataRange().getDisplayValues();
  for (let i = v.length - 1; i >= 1; i--) if (up(v[i][col]) === up(val)) s.deleteRow(i + 1);
}
function deleteStudent(n) { deleteRowsWhere('students', 1, n); deleteRowsWhere('grades', 1, n); return true; }
function deleteExam(id) { deleteRowsWhere('exams', 0, id); deleteRowsWhere('grades', 0, id); return true; }

function saveExam(title, date, grades) {
  title = String(title || '').trim();
  if (!title) throw new Error('Exam name is required');
  const id = String(Date.now());
  sheet('exams').appendRow([id, title, date || Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd')]);
  const known = new Set(rows('students').map(r => up(r[1])));
  const add = (grades || []).filter(g => known.has(up(g.neptun)) && String(g.grade).trim() !== '')
    .map(g => [id, up(g.neptun), String(g.grade).trim()]);
  if (add.length) { const s = sheet('grades'); s.getRange(s.getLastRow() + 1, 1, add.length, 3).setValues(add); }
  return add.length;
}

function studentGrades(neptun, pin) {
  const n = up(neptun), p = up(pin);
  const st = rows('students').find(r => up(r[1]) === n && up(r[2]) === p);
  if (!st) { Utilities.sleep(800); throw new Error('Wrong Neptun code or password'); }
  const exams = {};
  rows('exams').forEach(r => exams[r[0]] = { title: r[1], date: r[2] });
  const grades = rows('grades').filter(r => up(r[1]) === n && exams[r[0]])
    .map(r => ({ title: exams[r[0]].title, date: exams[r[0]].date, grade: r[2] }))
    .sort((a, b) => b.date.localeCompare(a.date));
  return { name: st[0], grades };
}

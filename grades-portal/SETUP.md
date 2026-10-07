# Physiology Grades — הוראות התקנה (פעם אחת, ~10 דקות)

## שלב 1: השרת (Google Sheets)
1. בחשבון Google של המרצה: https://sheets.new → לתת שם לגיליון, למשל "Physiology Grades".
2. בתפריט: **Extensions → Apps Script**.
3. למחוק את מה שיש ב‑`Code.gs` ולהדביק את כל התוכן של `apps-script/Code.gs`. לשמור (Ctrl+S).
4. **Deploy → New deployment** → בגלגל השיניים לבחור **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. **Deploy** → לאשר הרשאות (Advanced → Go to project → Allow).
6. להעתיק את ה‑**Web app URL** (מסתיים ב‑`/exec`).

## שלב 2: האפליקציה
1. ב‑`index.html` להדביק את הכתובת בשורה:
   `const API_URL = "https://script.google.com/macros/s/.../exec";`
2. להעלות את כל הקבצים בתיקייה (חוץ מ‑`apps-script/` ו‑`SETUP.md`) ל‑GitHub Pages / Netlify / Vercel (חינם).
   - GitHub Pages: ריפו חדש → להעלות קבצים → Settings → Pages → Branch: main → Save.

## שלב 3: שימוש
1. המרצה פותח את האפליקציה → **Lecturer** → מקליד סיסמה (הסיסמה הראשונה הופכת לסיסמת המרצה — לעשות את זה מיד!).
2. **Students** → מדביק מאקסל שם + נפטון → **Download passwords (CSV)** ושולח לכל סטודנט את הסיסמה שלו.
3. **New grades** → שם מבחן + תאריך → מקליד ציונים או מצלם דף ציונים → **Publish grades**.
4. סטודנטים: פותחים את הקישור → נפטון + סיסמה. בטלפון: Share → **Add to Home Screen** כדי לקבל אייקון כמו אפליקציה.

## הערות
- כל הנתונים נשמרים בגיליון (לשוניות Students / Exams / Grades). אפשר גם לערוך שם ידנית.
- אם משנים את `Code.gs`: Deploy → Manage deployments → ✏️ → Version: New version → Deploy (הכתובת נשארת אותו דבר).
- בלי `API_URL` האפליקציה רצה במצב הדגמה (נתונים לדוגמה).

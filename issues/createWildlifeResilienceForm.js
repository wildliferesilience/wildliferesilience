/**
 * ============================================================
 *  Wildlife Resilience: Issues
 *  Google Form + Linked Sheet Generator
 * ============================================================
 *
 * HOW TO USE
 * ----------
 * 1. Go to  https://script.google.com
 * 2. Click  "+ New project"
 * 3. Delete any starter code and paste this entire file
 * 4. Click  Run ▶  (or Run → Run function → createWildlifeResilienceForm)
 * 5. Approve the permission prompts (Google Forms + Sheets access)
 * 6. Open  View → Execution log  to find your Form & Sheet URLs
 *
 * AFTER RUNNING
 * -------------
 * • Open the Form edit URL
 * • Replace the "Screenshot URL" placeholder field with a real File Upload question
 *   (Apps Script can't create file-upload items — this is a Google API limitation)
 * • Preview the form and test all three category paths (Text / Bug-fix / New feature)
 * • Share the published Form URL with your team
 */

function createWildlifeResilienceForm() {

  // =============================================
  //  1.  CREATE THE FORM
  // =============================================
  var form = FormApp.create('Wildlife Resilience: Issues');

  form.setDescription(
    'Report text changes, bugs, or feature requests for the Wildlife Resilience project.\n\n' +
    'Choose a Category below — you\'ll only see the fields relevant to that issue type.'
  );
  form.setConfirmationMessage(
    'Thank you! Your issue has been logged and will be triaged shortly.'
  );


  // -------------------------------------------------------
  //  SECTION 1 — Intake  (everyone sees this first)
  // -------------------------------------------------------

  var categoryItem = form.addListItem();
  categoryItem.setTitle('Category');
  categoryItem.setHelpText('What type of issue is this?');
  categoryItem.setRequired(true);
  // (choices + navigation are wired up below, after all sections exist)

  form.addListItem()
    .setTitle('Area')
    .setHelpText('Which part of the project does this affect?')
    .setRequired(true)
    .setChoiceValues(['Website', 'Web App', 'Data', 'Other']);

  form.addTextItem()
    .setTitle('Page / Tab')
    .setHelpText('e.g., Tab 3, About, Map, etc.');


  // -------------------------------------------------------
  //  SECTION 2 — Text Change Details  (Category = Text)
  // -------------------------------------------------------

  var textPage = form.addPageBreakItem();
  textPage.setTitle('Text Change Details');
  textPage.setHelpText('Describe the text that needs changing.');

  form.addParagraphTextItem()
    .setTitle('Current Text')
    .setHelpText(
      'The exact text currently on the page that needs to change. ' +
      'Quote it if possible so we can find it quickly.'
    );

  form.addParagraphTextItem()
    .setTitle('Suggested Text')
    .setHelpText('What the text should say instead.');

  form.addParagraphTextItem()
    .setTitle('Text Change Notes')
    .setHelpText(
      'Why the change is needed — context, tone, accuracy, source reference, etc.'
    );


  // -------------------------------------------------------
  //  SECTION 3 — Bug Details  (Category = Bug-fix)
  // -------------------------------------------------------

  var bugPage = form.addPageBreakItem();
  bugPage.setTitle('Bug Details');
  bugPage.setHelpText('Describe the bug you encountered.');

  form.addParagraphTextItem()
    .setTitle('What you expected')
    .setHelpText('What should have happened?');

  form.addParagraphTextItem()
    .setTitle('What happened instead')
    .setHelpText('What actually occurred?');

  form.addParagraphTextItem()
    .setTitle('Steps to reproduce')
    .setHelpText('How can someone else trigger this bug? List the steps.');


  // -------------------------------------------------------
  //  SECTION 4 — Feature Request  (Category = New feature)
  // -------------------------------------------------------

  var featurePage = form.addPageBreakItem();
  featurePage.setTitle('Feature Request Details');
  featurePage.setHelpText('Describe the feature you\'d like to see.');

  form.addParagraphTextItem()
    .setTitle('Feature description')
    .setHelpText(
      'Describe the desired feature or behavior. What problem would it solve?'
    );


  // -------------------------------------------------------
  //  SECTION 5 — Additional Details  (everyone sees this)
  // -------------------------------------------------------

  var commonPage = form.addPageBreakItem();
  commonPage.setTitle('Additional Details');

  form.addListItem()
    .setTitle('Severity')
    .setHelpText('How serious is this issue?')
    .setRequired(true)
    .setChoiceValues(['Low', 'Medium', 'High', 'Blocking']);

  form.addTextItem()
    .setTitle('Browser / OS')
    .setHelpText('e.g., Chrome / Mac, Safari / iOS');

  form.addTextItem()
    .setTitle('Link')
    .setHelpText('Page URL if relevant');

  // NOTE: Google Apps Script cannot create File Upload items.
  // This placeholder text field should be manually replaced in the Form editor.
  form.addTextItem()
    .setTitle('Screenshot URL  — REPLACE with File Upload in Form editor')
    .setHelpText(
      'Paste a link to a screenshot (Google Drive, Imgur, etc.).\n' +
      'TO-DO for form admin: replace this text field with a File Upload question.'
    );

  form.addTextItem()
    .setTitle('Reporter name')
    .setHelpText('Optional');


  // -------------------------------------------------------
  //  CONDITIONAL NAVIGATION
  // -------------------------------------------------------
  //
  //  Category = Text        → textPage     → commonPage
  //  Category = Bug-fix     → bugPage      → commonPage
  //  Category = New feature → featurePage  → commonPage
  //
  //  setGoToPage on a PageBreakItem controls what happens when
  //  the PREVIOUS section completes and reaches this break via
  //  sequential flow.  It does NOT affect users who navigate
  //  to this break via choice navigation.

  categoryItem.setChoices([
    categoryItem.createChoice('Text',        textPage),
    categoryItem.createChoice('Bug-fix',     bugPage),
    categoryItem.createChoice('New feature', featurePage)
  ]);

  // Skip forward to commonPage when arriving via sequential flow
  bugPage.setGoToPage(commonPage);
  featurePage.setGoToPage(commonPage);


  // =============================================
  //  2.  CREATE & LINK THE RESPONSE SPREADSHEET
  // =============================================

  var ss = SpreadsheetApp.create('Wildlife Resilience: Issues (Responses)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // Give Google a moment to generate the "Form Responses 1" sheet
  SpreadsheetApp.flush();
  Utilities.sleep(3000);

  // Re-open to pick up the newly created response sheet
  ss = SpreadsheetApp.openById(ss.getId());

  var responseSheet = null;
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().indexOf('Form Responses') !== -1) {
      responseSheet = sheets[i];
      break;
    }
  }
  if (!responseSheet) {
    responseSheet = sheets[0]; // fallback
  }


  // =============================================
  //  3.  ADD TRIAGE COLUMNS  (not in the form)
  // =============================================

  var lastCol = responseSheet.getLastColumn();
  if (lastCol < 1) lastCol = 16;
  var triageStart = lastCol + 1;

  var triageHeaders = [
    'Status',            // dropdown: New | Triaged | In progress | Blocked | Done | Won't fix
    'Owner',             // free text
    'Priority',          // dropdown: P0 | P1 | P2
    'GitHub Issue URL',  // free text (link)
    'GH Issue #',        // free text
    'Release/Version',   // free text
    'Notes'              // free text
  ];

  // Write headers
  var headerRange = responseSheet.getRange(1, triageStart, 1, triageHeaders.length);
  headerRange.setValues([triageHeaders]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#E8EAF6');

  // Data validation: Status
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'New', 'Triaged', 'In progress', 'Blocked', 'Done', "Won't fix"
    ])
    .setAllowInvalid(false)
    .build();
  responseSheet.getRange(2, triageStart, 500, 1).setDataValidation(statusRule);

  // Data validation: Priority
  var priorityCol = triageStart + 2;
  var priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['P0', 'P1', 'P2'])
    .setAllowInvalid(false)
    .build();
  responseSheet.getRange(2, priorityCol, 500, 1).setDataValidation(priorityRule);

  // Freeze header row
  responseSheet.setFrozenRows(1);

  // Remove empty default "Sheet1" if present
  try {
    for (var j = 0; j < sheets.length; j++) {
      if (sheets[j].getName() === 'Sheet1' && sheets[j].getLastRow() <= 1) {
        ss.deleteSheet(sheets[j]);
        break;
      }
    }
  } catch (e) {
    // Can't delete the only sheet — not a problem
  }


  // =============================================
  //  4.  LOG RESULTS
  // =============================================

  var formUrl  = form.getPublishedUrl();
  var editUrl  = form.getEditUrl();
  var sheetUrl = ss.getUrl();

  Logger.log('');
  Logger.log('==========================================');
  Logger.log('  WILDLIFE RESILIENCE: ISSUES — COMPLETE');
  Logger.log('==========================================');
  Logger.log('');
  Logger.log('Form (share this):   ' + formUrl);
  Logger.log('Form (edit):         ' + editUrl);
  Logger.log('Sheet (tracker):     ' + sheetUrl);
  Logger.log('');
  Logger.log('NEXT STEPS:');
  Logger.log('1. Open the Form edit URL');
  Logger.log('2. Replace "Screenshot URL" text field with a File Upload question');
  Logger.log('3. Preview the form — test Text, Bug-fix, and New feature paths');
  Logger.log('4. Share the published Form URL with your team');
  Logger.log('');
}

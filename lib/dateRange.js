const moment = require('moment')
const { google } = require('googleapis')
const oAuth2Client = require('./googleClient')

oAuth2Client.setCredentials({
  access_token: process.env.SHEETS_ACCESS_TOKEN,
  refresh_token: process.env.SHEETS_REFRESH_TOKEN,
  scope: process.env.SHEETS_SCOPE,
  token_type: process.env.SHEETS_TOKEN_TYPE,
  expiry_date: process.env.SHEETS_EXPIRY_DATE
})

const sheets = google.sheets({
  version: 'v4',
  auth: oAuth2Client
})

exports.getDates = async function(){
  // Default start from beginning of last month...
  // ends now.
  // this ensures we always fully update last month,
  // and keep current month up-to-date
  var promise = new Promise((resolve, reject) =>{
    // clear working area for cells
    sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.SHEETS_SHEET_ID,
      range: 'B1:Z100',
    }, (err, res) => {
      if (err) {
        return console.log('Update failed: ', err)
      }
      console.log('Success! Cells Cleared.')
    })

    // clear first column for summary tables
    sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.SHEETS_SHEET_ID,
      range: 'A4:A100',
    }, (err, res) => {
      if (err) {
        return console.log('Update failed: ', err)
      }
      console.log('Success! Column Cleared.')
    })

    // read for date range
    sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEETS_SHEET_ID,
      range: 'A2:A3',
    }, (err, res) => {
      if (err) {
        return console.log('Read failed: ', err);
      }
      start = res.data.values[0][0]
      end = res.data.values[1][0]
      if (start === '.') {
        start = moment()
          .subtract(1, 'month')
          .startOf('month')
          .format('YYYY-MM-DD');
      }
      if (end === '.') {
        end = moment().format('YYYY-MM-DD')
      }
      resolve([start,end])
      console.log('Success! Dates read.')
    })
  });
  return promise;
}

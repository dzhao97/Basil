const { google } = require('googleapis')
const moment = require('moment')
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

exports.updateSheet = async function(updates) {
  //import data
  sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: process.env.SHEETS_SHEET_ID,
    resource: {
      valueInputOption: `USER_ENTERED`,
      data: updates.map(p => ({
        range: p.range,
        values: p.values
      }))
    }
  }, (err, res) => {
    if (err) {
      return console.log('Update failed: ', err)
    }
    console.log(`Success! ${res.data.totalUpdatedCells} cells updated.`)
  })

  let requests = [];
  //freeze top row
  requests.push({
    updateSheetProperties: {
      properties: {
        gridProperties: {frozenRowCount: 1},
      },
      fields: 'gridProperties.frozenRowCount',
    },
  });

  //freeze left column
  requests.push({
    updateSheetProperties: {
      properties: {
        gridProperties: {frozenColumnCount: 1},
      },
      fields: 'gridProperties.frozenColumnCount',
    },
  });

  //bold top row
  requests.push({
    repeatCell: {
      range: {endRowIndex: 1},
      cell: {userEnteredFormat: {textFormat: {bold: true}}},
      fields: 'userEnteredFormat.textFormat.bold',
    }
  })

  //format amount with $
  requests.push({
    repeatCell: {
      range: {
        startRowIndex: 1,
        startColumnIndex: 4,
        endColumnIndex: 5,
      },
      cell: {
        userEnteredFormat: {
          numberFormat: {
            type: 'CURRENCY',
            pattern: '$#,##0.00'
          }
        }
      },
      fields: 'userEnteredFormat.numberFormat',
    }
  })

  const batchUpdateRequest = {requests};
  sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.SHEETS_SHEET_ID,
    resource: batchUpdateRequest,
    }, (err, res) => {
        if (err) {
          return console.log('Update failed: ', err)
        }
        console.log('Success! Data formatted.')
    })
}

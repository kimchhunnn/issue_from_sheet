function createOrUpdateIssues() {
  // Config
  var accessToken = '' // replace your github access token
  var username = '' // replace your github username
  var headerRowLength = 1
  var offset = 5 + headerRowLength
  var baseUrl = 'https://api.github.com/repos/'

  // Constant
  const ERROR_COLOR = '#E06666'
  const DEFAULT_COLOR = '#ffffff'
  const STATUS = {
    'error': 'ERROR',
    'success': 'SUCCESS'
  }
  const COLUMN_RANGE_MAPPING = {
    'issue_id': 1,
    'repository': 2,
    'title': 3,
    'content': 4,
    'assignees': 5,
    'milestone': 6,
    'labels': 7,
    'status': 8,
    'detail': 9,
  }

  // Make a POST request 
  var header = {
    "Authorization": `token ${accessToken}`,
    "Accept": "application/vnd.github.v3+json",
    "Content-Type": "application/json"
  };

  var sheet = SpreadsheetApp.getActive().getSheetByName("Sheet1");
  var row = sheet.getLastRow();
  var data = sheet.getRange(offset + 1, 1, row - offset, 9).getValues();
  var currentRow = offset
  data.forEach(function (row) {
    currentRow += 1
    try {
      // range
      var statusRange = sheet.getRange(currentRow, COLUMN_RANGE_MAPPING['status'])
      var issueIdRange = sheet.getRange(currentRow, COLUMN_RANGE_MAPPING['issue_id'])
      var detailRange = sheet.getRange(currentRow, COLUMN_RANGE_MAPPING['detail'])
      var repositoryRange = sheet.getRange(currentRow, COLUMN_RANGE_MAPPING['repository'])
      var titleRange = sheet.getRange(currentRow, COLUMN_RANGE_MAPPING['title'])

      var repo = row[COLUMN_RANGE_MAPPING['repository'] - 1] // row is array, start from index 0
      var issueId = row[COLUMN_RANGE_MAPPING['issue_id'] - 1]
      var title = row[COLUMN_RANGE_MAPPING['title'] - 1]
      var body = row[COLUMN_RANGE_MAPPING['content'] - 1]
      var assignees = row[COLUMN_RANGE_MAPPING['assignees'] - 1]
      var milestone = row[COLUMN_RANGE_MAPPING['milestone'] - 1]
      var labels = row[COLUMN_RANGE_MAPPING['labels'] - 1]
      
      // validation
      if (repo === '') {
        repositoryRange.setBackground(ERROR_COLOR);
        throw new Error('Missing Value: Please enter repository name.')
      }
      if (title === '') {
        titleRange.setBackground(ERROR_COLOR);
        throw new Error('Missing Value: Please enter title name.')
      }
      
      var payload = {
        "title": title, 
        "body": body,
      }

      // optional field
      if (assignees !== '') {
        payload['assignees'] = assignees.split(',')
      }
      if (milestone !== '') {
        payload['milestone'] = milestone
      }
      if (labels !== '') {
        payload['labels'] = labels.split(',')
      }

      var options = {
        'method' : 'POST',
        'headers' : header,
        'payload': JSON.stringify(payload)
      };

      var createPath = baseUrl + `${username}/${repo}/issues`
      var updatePath = baseUrl + `${username}/${repo}/issues/${issueId}`

      var url = createPath // default operation is creation
      if (issueId !== '') {
        url = updatePath
      }

      var response = UrlFetchApp.fetch(url, options)
      json_response = JSON.parse(response)

      statusRange.setValue(STATUS['success'])
      statusRange.setBackground(DEFAULT_COLOR);

      issueIdRange.setValue(json_response['number'])

      detailRange.setValue('')
      detailRange.setBackground(DEFAULT_COLOR);

      repositoryRange.setBackground(DEFAULT_COLOR);
      titleRange.setBackground(DEFAULT_COLOR);
    } catch (err) {
      detailRange.setValue(err['message'])
      detailRange.setBackground(ERROR_COLOR);

      statusRange.setValue(STATUS['error'])
      statusRange.setBackground(ERROR_COLOR);
    }
  })
}
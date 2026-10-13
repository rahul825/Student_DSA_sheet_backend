const sheetService = require("./sheet.service");

async function getSheet(req, res) {
  res.json(await sheetService.getSheetForUser(req.userId));
}

module.exports = { getSheet };

const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "Titles.json");
const utils = require("../../utils");
class TitleBuilder {
  static GetTitleForStatus(reqStatus) {
    return new Promise((res, rej) => {
      try {
        fs.readFile(filePath, (err, titlesJson) => {
          const titlesObj = JSON.parse(titlesJson);
          for (const [statusTitles, titles] of Object.entries(titlesObj)) {
            if (reqStatus === statusTitles) {
              res(utils.selectRandomFromArray(titles));
            }
          }
          res("");
        });
      } catch (ex) {
        rej(ex);
      }
    });
  }
}
module.exports = TitleBuilder;

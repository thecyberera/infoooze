const request = require('request');
const chalk = require('chalk');
const { sentenceCase } = require('sentence-case');
const { input, info, currentTimeStamp, saveTo, errorMsg } = require('./common');

const key = require('./secret');

const list = async (counter, key, value) => {
  counter = counter <= 9 ? '0' + counter : counter;
  value = sentenceCase(value);

  value = value == 'Unrated' ? chalk.yellowBright(value) : value;
  value = value == 'Clean' ? chalk.greenBright(value) : value;
  value = value == 'Phishing' ? chalk.redBright(value) : value;
  value = value == 'Malicious' ? chalk.redBright(value) : value;

  key = sentenceCase(key);

  console.log(
    chalk.white('[') +
      chalk.hex('#FFA500')(counter) +
      chalk.white('] ') +
      chalk.whiteBright(key + ' : ') +
      value,
  );
};

const bs = (data) => Buffer.from(data).toString('base64').replace(/[=]/g, '');

const scanUrl = async (website, showHome = false, i = 1) => {
  website = website || (await input('Your Website'));

  const path = `${process.cwd()}/results/infoooze_websiteScan_${currentTimeStamp()}.txt`;
  info(`Results will be saved in `, path);

  request(
    {
      method: 'GET',
      url: `https://www.virustotal.com/api/v3/urls/${bs(website)}`,
      headers: {
        Accept: 'application/json',
        'x-apikey': key('vt'),
      },
      timeout: 5000,
      json: true,
    },
    async (error, response) => {
      if (error) {
        errorMsg();
      } else {
        if (response.statusCode == 200) {
          let analyseResult =
            response.body.data.attributes.last_analysis_results;

          Object.keys(analyseResult).forEach((company, index) => {
            setTimeout(() => {
              list(i++, company, analyseResult[company]['result']);
              saveTo(path, company, analyseResult[company]['result']);
            }, 150 * index);
          });
        } else {
          errorMsg('Something went wrong! Please try again after some time.');
        }
      }
    },
  );
};

module.exports = scanUrl;
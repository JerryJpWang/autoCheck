const puppeteer = require("puppeteer");
const schedule = require("node-schedule");
const nodemailer = require('nodemailer');

const config = {
  txtUserName: "",
  txtPassword: "",
  mailhost: "",
  mailuser: "",
  mailpass: "",
  mailfrom: "",
  mailto: "",
  signIn: { hour: 09, minute: 55 },
  signOut: { hour: 19, minute: 05 },
}

// signIn
schedule.scheduleJob(config.signIn, function () {
  check().then(sendMail());
});

// signOut
schedule.scheduleJob(config.signOut, function () {
  check().then(sendMail());
});

const d = new Date();
const dMonth = ((d.getMonth() + 1).toString().padStart(2,'0'));
const dDate = ((d.getDate()).toString().padStart(2,'0'));
const dHours = ((d.getHours()).toString().padStart(2,'0'));
const dMinutes = ((d.getMinutes()).toString().padStart(2,'0'));
const dt = `${d.getFullYear()}${dMonth}${dDate}${dHours}${dMinutes}`;

let check = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://172.16.41.55/wYTFlow/Default.aspx");

  await page.$eval("#txtUserName", (el) => (el.value = config.txtUserName));
  await page.$eval("#txtPassword", (el) => (el.value = config.txtUserName));
  await page.click("#cmdOK");

  await page.goto("http://172.16.41.55/wYTFlow/Sign.aspx");
  await page.click("#ContentPlaceHolder1_cmdSign");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `./${dt}_AutoCheck.png` });
  await browser.close();
};

let sendMail = async () => {
  var transport = nodemailer.createTransport({
    host: config.mailhost,
    port: 2525,
    auth: {
      user: config.mailuser,
      pass: config.mailpass
    }
  });

  let message = {
    from: config.mailfrom,
    to: config.mailto,
    subject: `${dt}_AutoCheck`,
    html: 'autoCheck：<img src="cid:AutoCheckId"/>',
    attachments: [
      {
        filename: `${dt}_AutoCheck`,
        path: __dirname + `/log/${dt}_AutoCheck.png`,
        cid: "AutoCheckId",
      },
    ],
  };

  transport
    .sendMail(message, (error, info) => {
      if (error) {
        console.log(error.message);
        return;
      }
      console.log("success");
      console.log('response "%s"', info.response);
      transporter.close();
    });
};

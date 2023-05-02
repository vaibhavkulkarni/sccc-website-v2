"use strict";
let express = require("express");
let cors = require("cors");
let bodyParser = require("body-parser");
let dotenv = require("dotenv").config();
let nodemailer = require("nodemailer");
let smtpTrans = require("nodemailer-smtp-transport");
let validator = require("email-validator");
let sanitize = require("sanitize-html");

let smtp = { auth: {}, secure: true, debug: false };
smtp.service = process.env.EMAIL_SERVICE;
smtp.auth.user = process.env.EMAIL_USER;
smtp.auth.pass = process.env.EMAIL_PASSWORD;
const transporter = nodemailer.createTransport(smtpTrans(smtp));

const app = express();
app.disable("x-powered-by");
app.use(express.urlencoded({ limit: "1mb", extended: false }));
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN,
    allowedHeaders: ["Content-Type", "application/json; charset=utf-8", "text/html; charset=utf-8"],
  })
);

app.use("/contact-svc/assets", express.static(__dirname + "/assets"));

app.post("/contact-svc", function (req, res) {
  if (validate(req.body.email)) {
    return sendEmail(req.body, res);
  }
  res.status(403).json({ validation: "no email" });
});

app.listen(7000, function () {
  console.log("Listening on http://localhost:7000");
});

function sendEmail(data, res) {
  let email = { from: data.email, to: process.env.EMAIL_USER };
  email.subject = "Message from suttonchallengers.org";

  const output = `
        <p>Hello,<p>
        <p>You got a new contact request.</p>
        <h3>Contact Details</h3>
        <ul>
            <li>Name: ${data.name}</li>
            <li>Email: ${data.email}</li>
            <li>Name: ${data.phone}</li>
        </ul>
        <h3>Message:</h3>
        <p>${data.message}</p>
    `;
  email.html = sanitize(output, {
    allowedTags: defaults.allowedTags.concat(["img"]),
  });
  transporter.sendMail(email, function (error, info) {
    if (error) {
      return res.json({ sendEmail: "failed" });
    }
    res.json({ sendEmail: "ok" });
  });
}

"use strict";
let express = require("express");
let cors = require("cors");
let bodyParser = require("body-parser");
let dotenv = require("dotenv").config();
let nodemailer = require("nodemailer");
let smtpTrans = require("nodemailer-smtp-transport");
let validator = require("email-validator");
let sanitize = require("sanitize-html");
let fs = require("fs");

const TRUNSTILE_SECRET_KEY = process.env.TRUNSTILE_SECRET_KEY;
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

app.post("/contact-svc", async function (req, res) {
  if (validator.validate(req.body.email)) {
    let formData = new URLSearchParams();
    formData.append("secret", TRUNSTILE_SECRET_KEY);
    formData.append("response", req.body["cf-turnstile-response"]);

    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const result = await fetch(url, {
      body: formData,
      method: "POST",
    });

    const outcome = await result.json();
    if (outcome.success) {
      return sendEmail(req.body, res);
    } else {
      console.error("Bots not allowed! ", outcome);
    }
  }
  res.status(403).json({ validation: "no email" });
});

app.listen(7000, function () {
  console.log("Listening on http://localhost:7000");
});

function sendEmail(data, res) {
  let email = { from: process.env.EMAIL_USER, to: process.env.EMAIL_USER };
  email.subject = "Contact reuqest: " + data.subject;

  const output = `
        <p>Hello,<p>
        <p>You got a new contact request.</p>
        <h3>Contact Details</h3>
        <ul>
            <li>Name: ${data.name}</li>
            <li>Email: ${data.email}</li>
            <li>Phone: ${data.phone}</li>
        </ul>
        <h3>Message:</h3>
        <p>${data.message}</p>
    `;
  email.html = sanitize(output, {
    allowedTags: sanitize.defaults.allowedTags.concat(["img"]),
  });
  transporter.sendMail(email, function (error, info) {
    if (error) {
      console.error(error);
      return res.json({ sendEmail: "failed" });
    }
    res.json({ sendEmail: "ok" });
  });
}

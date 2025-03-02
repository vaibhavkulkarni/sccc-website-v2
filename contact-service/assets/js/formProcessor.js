var formProcessor = (function () {
  "use strict";

  var constraints = {
    name: {
      presence: true,
      length: {
        minimum: 2,
        maximum: 30,
        message: "must be longer.",
      },
    },
    email: {
      presence: true,
      email: true,
    },
    subject: {
      presence: true,
      length: {
        minimum: 5,
        maxumum: 25,
        message: "must be longer.",
      },
    },
    message: {
      presence: true,
      length: {
        minimum: 10,
        maxumum: 4000,
        message: "must be longer.",
      },
    },
  };

  function formAlert(text) {
    document.getElementById("responsemsg").innerHTML = "<br><p><em>" + text + "</em></p>";
  }

  function sendData(data) {
    formAlert("One second...");
    var postURL = "https://www.suttonchallengers.org/contact-svc/";
    var http = new XMLHttpRequest();
    http.open("POST", postURL, true);
    http.setRequestHeader("Content-Type", "application/json");
    data.source_url = window.location.href;
    http.send(JSON.stringify(data));
    http.onload = function () {
      formAlert("Thank you, your message has been sent!");
      document.getElementById("contact-form").reset();
    };
  }

  return {
    process: function () {
      var attributes = {
        name: document.forms["contact-form"]["name"].value,
        email: document.forms["contact-form"]["email"].value,
        phone: document.forms["contact-form"]["phone"].value,
        subject: document.forms["contact-form"]["subject"].value,
        message: document.forms["contact-form"]["message"].value,
      };
      validate
        .async(attributes, constraints)
        .then(function (success) {
          success["cf-turnstile-response"] = document.forms["contact-form"]["cf-turnstile-response"].value;
          sendData(success);
        })
        .catch(function (error) {
          console.log(error);
          formAlert(Object.values(error)[0][0]);
        });
    },
  };
})();

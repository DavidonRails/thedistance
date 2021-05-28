<div align="center">
  <p>Backend</p>
  <h1>AWS Lambda & DynomoDB</h1>
</div>

## 👋 Intro

<h1>🔷 Live URL : </h1>
https://kahnuf9uud.execute-api.us-east-2.amazonaws.com/test

<h4>You can see the different result when running this url web browser of each OS( iOS, Android, PC)</h4>

<h1>🔷 Lambda function : </h1>
This file is AWS Lambda function to use AWS DynomoDB.

This Lambda redirector process a GET request to a specific URL, determine whether the device making the request is running iOS, Android, or something else, then redirect the browser to the relevant app on Apple’s App Store or Google Play, or another page for all other devices/browsers.

For each request the redirector store data to count the number of times it has been called for each OS (Android/iOS/Other) on AWS DynomoDB.

<h1>🔷 Params : </h1>

  - OS : Platform of device making the request 
    value:  (ios, android, other)

  - Location : redirector url
    value:   other => web page url
            android => google play stor url
            ios => apple store url

  - Count : Total number of requests on each platform

<h1>🔷 Result : </h1>

#### Android

{
  "headers":
  {
    "Location":"https://play.google.com/store/apps/details?id=uk.jifflr.app&hl=en_GB",
    "OS":"android",
    "Count": 11
  }
}


#### iOS

{
  "headers":
  {
    "Location":"https://apps.apple.com/gb/app/jifflr/id1434427409",
    "OS":"ios",
    "Count":2
  }
}

#### Android

{
  "headers":
  {
    "Location":"https://jifflr.com/",
    "OS":"android",
    "Count":8
  }
}

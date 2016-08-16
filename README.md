# echo-sony-bravia

Everything needed for Amazon Alexa and a Sony Bravia Android TV integration.

# Usage

How to use:

* : "Alexa, ask TV to ..."
* : "Alexa, ask TV to got to channel one hundred and one"
* : "Alexa, ask TV to turn the volume up ten"
* : "Alexa, ask TV to go to home"
... and a whole load more.


# How it works

1. When you say the command to Alexa, it triggers the Alexa skill with invocation name TV.
2. The Alexa skill calls a web service running on AWS Lambda, passing it the preset name. 
3. Lambda then fires an HTTP request to a node.js server running http-bravia-echo on your local network.
4. http-bravia-echo interprets the command and relays to the TV over your local network.

Included here are the Alexa API definitions, the Lambda AWS service that catches the Alexa requests, and an example preset configuration for jishi's http-bravia-echo to actually play the music.

To set it up, you need to do the following:

# Get the bravia node js server working
1. Install node.js on a server on the same network as your TV.
2. Grab the nodeJS server code for the bravia (https://github.com/alisalama/bravia) and run it on that server. On Mac, it's "npm install https://github.com/alisalama/bravia", then go to the directory created and "npm start".
3. Test it by hitting http://yourserverip:5006/WakeUp to turn the TV on, or http://yourserverip:5006/WakeUp to open up Netflix. Should get an OK response, and the TV should respond.
4. If you have problems, make sure you are on the same network as your TV, or leave a comment.

# Expose your server to the outside world
1. You need some way for Lambda to contact your server consistently. Services like DynDns and yDNS.eu will give you a consistent hostname for the outside world to use. 
2. On your local router, find the "Port Forwarding" configuration. Forward all inbound requests to 5006 (or configure some other port) to your node server.
3. Make sure your server has a locally static IP, so port forwarding doesn't lose track of it.
4. Setup your server to auto-start or daemonize the http-bravia-echo server. I used PM2 (https://github.com/Unitech/pm2) on a raspberry pi for this.
5. Test it by hitting http://yourdyndnsaddress:5005/WakeUp.

# Create the Alexa Skill that will send events to AWS Lambda
1. Create a new Skill in the Alexa Skills control panel on Amazon. You need a developer account to do this.
2. Name can be whatever you want. "Invocation" is what you say (I used "TV", but you could use something else).
3. Check Custom Interaction Model if it is not already checked. Click Next
4. Click Next, taking you to Interaction Model. Create a Custom Slot Type ("Add Slot Type").
Add a new type for BUTTONS, another for DIRECTIONS. Into each, copy/paste the contents of [echo/custom_slots/BUTTONS.slot.txt](https://raw.githubusercontent.com/alisalama/echo-sony-bravia/master/echo/custom_slots/BUTTONS.slot.txt) and [echo/custom_slots/ROOMS.slot.txt](https://raw.githubusercontent.com/alisalama/echo-sony-bravia/master/echo/custom_slots/DIRECTIONS.slot.txt).
5. Still in Interaction Model, copy this repo's [echo/intents.json](https://raw.githubusercontent.com/alisalama/echo-sony-bravia/master/echo/intents.json) into the "Intent Schema" field, and [echo/utterances.txt](https://raw.githubusercontent.com/alisalama/echo-sony-bravia/master/echo/utterances.txt) into "Sample Utterances".
6. Don't test yet, just save. Click back to "Skill Information" and copy the "Application ID". You'll need this for Lambda.

# Configure the AWS Lambda service that will trigger your http-bravia-echo server
1. Create an AWS Lambda account if you don't have one already. It's free!
2. In the Lambda console, look to the upper right. Make sure "N. Virginia" is selected, because not every zone supports Alexa yet.
3. Create a new Lambda function. Skip the blueprint. 
4. Pick any name you want, and choose runtime Node.js.
5. Go into this repo's [lambda/src](lamda/src) directory and edit the options.js to have your DynDNS hostname, your port, and the Alexa App ID you just copied.
6. In lambda/src, zip up everything. On Mac/Linux, `cd src; chmod a+r *.js; zip src.zip *.js`.  Make sure you don't capture the folder, just the files.
7. Choose to upload the zip file for src.zip.
8. The default handler is fine. Create a new role of type Basic Execution Role. Pick smallest possible memory and so on.
9. Click Next to proceed. Once created, click "Event Sources".
10. Add a source.  Choose "Alexa Skills Kit".
11. Test it out. I included a test blueprint in this repo. Click "Test" and copy/paste this repo's [lambda/play_intent_testreq.json](https://raw.githubusercontent.com/alisalama/echo-sony-bravia/master/lambda/play_intent_testreq.json) to test. It will trigger the "WakeUp" preset in your presets.json file on your Node server. Don't forget to replace the Alexa App Id again.

# Connect Alexa Skill to AWS Lambda
1. In the Lambda console, copy the long "ARN" string in the upper right.  
2. Go back into the Alexa Skill console, open your skill, click "Skill Information", choose Lambda ARN and paste that ARN string in.
3. Now you're ready to put it all together. Try "Alexa, ask the TV to turn on" or "Alexa, Ask the TV to go to Netflix"


# Troubleshooting
1. If you have trouble with your node server not triggering the TV even when you hit it on localhost, it probably can't find it, check the IP address of the TV or check that the settings on the TV allow remote control.
2. If your Lambda test doesn't work, then you might have a case mis-match between the preset name in presets.json and the value in the Lambda test. It's also possible Lambda can't reach your host because your DynDNS setup isn't working, or a firewall is blocking it. If you're unsure, try the Maker plugin on IFTTT, to see if you can get it working externally from someplace else.
3. If Alexa says something about not being able to use your skill, then Lambda is probably returning an error. Check the Lambda logs. Alexa will say this if she doesn't see a proper response from the Lambda server.
4. If you run into a syntax error on http-bravia-echo that looks something like "Syntax error in module 'index': SyntaxError at exports.runInThisContext", then it's likely that you inadvertently edited presets.json with a rich text editor and it replaced some of your quotation marks with quotes from a weird character set.  Try pasting your presets.json into a JSON linter like [jsonlint.com](http://www.jsonlint.com) and it should point out this error.

# Thanks
Big shout out to Ryan Graciano (https://github.com/rgraciano/echo-sonos) for his Sonos integration, and to Alan Reid (https://github.com/alanreid/bravia) for his work on the Bravia remote control.

# Upgrade Checklist
When upgrading your code to the latest version, make sure you do the following:

1. In the Interaction Model under the Alexa Skills Kit console, update the Intents, the Utterances, and the two Custom Slot Types
2. Zip all of the .js files (without the folder - just the .js) and update them in Lambda

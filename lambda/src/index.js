'use strict';

var http = require('http');
var https = require('https');

var options = require('./options');
var AlexaSkill = require('./AlexaSkill');

var EchoBravia = function () {
    AlexaSkill.call(this, options.appid);
};

EchoBravia.prototype = Object.create(AlexaSkill.prototype);
EchoBravia.prototype.constructor = EchoBravia;

EchoBravia.prototype.intentHandlers = {

    // Specific Intents
    PowerOnIntent: function (intent, session, response) {
        console.log("PowerOnIntent received");
        options.path = '/WakeUp';
        httpreq(options, function(error) {
            genericResponse(error, response);
        });
    },
    // Specific Intents
    PowerOffIntent: function (intent, session, response) {
        console.log("PowerOffIntent received");
        options.path = '/PowerOff';
        httpreq(options, function(error) {
            genericResponse(error, response);
        });
    },
    MenuIntent: function (intent, session, response) {
        console.log("MenuIntent received");
        options.path = '/Home';
        httpreq(options, function(error) {
            genericResponse(error, response);
        });
    },
    NetflixIntent: function (intent, session, response) {
        console.log("NetflixIntent received");
        options.path = '/Netflix';
        httpreq(options, function(error) {
            genericResponse(error, response);
        });
    },
    
    ReturnIntent: function (intent, session, response) {
        console.log("ReturnIntent received");
        options.path = '/Return';
        httpreq(options, function(error) {
            genericResponse(error, response);
        });
    },
    InputIntent: function (intent, session, response) {
        console.log("NetflixIntent received");
        options.path = '/Input';
        httpreq(options, function(error) {
            genericResponse(error, response);
        });
    },
    ConfirmIntent: function (intent, session, response) {
        console.log("ConfirmIntent received");
        options.path = '/Confirm';
        httpreq(options, function(error) {
            genericResponse(error, response);
        });
    },
    SubTitleIntent: function (intent, session, response) {
        console.log("SubTitleIntent received");
        options.path = '/SubTitleIntent';
        httpreq(options, function(error) {
            genericResponse(error, response);
        });
    },
    GGuideIntent: function (intent, session, response) {
        console.log("ConfirmIntent received");
        options.path = '/GGuideIntent';
        httpreq(options, function(error) {
            genericResponse(error, response);
        });
    },
    // Channel Up/Down intent - handles moving by channels up and down
    ChannelIntent: function (intent, session, response) {
                
        console.log("Channel " + intent.slots.Direction.value + " Intent received");

        var direction = capitalize(intent.slots.Direction.value);
        
        console.log("Channel" + direction);

        //Set the direction.
        options.path = '/Channel' + direction;

        httpreq(options, function(error) {
            genericResponse(error, response);
        });      
    },


    // More generic intents.
    // Handles the number pad
    NumberIntent: function (intent, session, response) {
        console.log("Number Intent received");
        console.log(intent);
        numberHandler('Num', intent.slots.Number.value, response);
    },

    // Handles the toggling of HDMI sources
    HdmiIntent: function (intent, session, response) {
        
        console.log("Hdmi Intent received");
        numberHandler('Hdmi', intent.slots.Number.value, response);
    },

    // Handles the toggling of HDMI sources
    VideoIntent: function (intent, session, response) {
        
        console.log("Video Intent received");
        numberHandler('Video', intent.slots.Number.value, response);
    },

    // Volume intent - handles moving by multiple volume points and up and down
    VolumeIntent: function (intent, session, response) {
        
        // Defaults to 10 if empty
        if(!intent.slots.Number.value){
            intent.slots.Number.value = 5;
        }

        console.log("Volume " + intent.slots.Number.value + " Intent received");

        var direction = capitalize(intent.slots.Direction.value);
        
        console.log("Volume" + direction + intent.slots.Number.value);

        //Set the direction.
        options.path = '/Volume' + direction;

        //then loop through and call it multiple times.
        for (var i = 0; i<intent.slots.Number.value; i++){

            httpreq(options, function(error) {
                genericResponse(error, response);
            });
        }    
    },

    // MoveIntent - handles moving by multiple volume points and up and down
    MoveIntent: function (intent, session, response) {
        
        // Defaults to 1 if empty
        if(!intent.slots.Number.value){
            intent.slots.Number.value = 1;
        }

        console.log(intent.slots.Number.value + " " + intent.slots.Direction.value + '(s) Intent received');

        var direction = capitalize(intent.slots.Direction.value);

        //Set the direction.
        options.path = '/Cursor' + direction;
        var urls = [];

        //Loop over the multiple moves.
        for (var i = 0; i<intent.slots.Number.value; i++){
         
            httpreq(options, function(error) {
                genericResponse(error, response);
            });
        }
        
    },

    // Generic button intent - only works on buttons where the intent is one word (i.e. Left or Right, not WakeUp) due to the capitalisation.
    // Also only works for specificied intents, so for example where I wish to say "Source" instead of "Input" to call the InputIntent, I have to set up a specific intent.
    ButtonIntent: function (intent, session, response) {

        console.log("Button Intent received");
        
        var button = capitalize(intent.slots.Button.value);

        options.path = '/' + button;

        httpreq(options, function(error) {
            genericResponse(error, response);
        });
    }

}

function httpreq(options, responseCallback) {
    var transport = options.useHttps ? https : http;
    
    console.log("Sending " + (options.useHttps ? "HTTPS" : "HTTP" ) + " request to: " + options.path);
  
    var req = transport.request(options, function(httpResponse) {
        var body = '';
        
        httpResponse.on('data', function(data) {
            body += data;
        });
        
        httpResponse.on('end', function() {
            responseCallback(undefined, body);
        });
    });

    req.on('error', function(e) {
        responseCallback(e);
    });

    req.end();
}

function genericResponse(error, response, success) {
    
    var text = 'That bus stop does not exist.'
    var cardText = text;


    if (!error) {
        if (!success) {
            response.tell("OK");
            response.tellWithCard("Ok", "Ok", cardText);
        }
        else {
            response.tell(success);
            response.tellWithCard("success", "success", success);
        }
    }
    else {

        response.tell("The Lambda service encountered an error: " + error.message);

    }
}

/** Handles up, down, & absolute volume for either an individual room or an entire group */
function numberHandler(action, value, response) {

    //Check they exist    
    if(action && value){
        console.log(action + value + " received");
        options.path = '/' + action + value;    
    }
    
    httpreq(options, function(error) {
        genericResponse(error, response);
    }); 
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the EchoBravia skill.
    var echoBravia = new EchoBravia();
    echoBravia.execute(event, context);
};

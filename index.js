'use strict'
let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');

const APP_TOKEN = 'EAAbX7KBxzAQBAMZAuLy7GibCHyoF9kbUdO36RAg8UCh65ZCmtVrQGgNF6mSh5HaTehGH234GGA2900BsfiTYoMcxrt02ZCJuzqmF0n46SLhUiI47Om36OXwTgTCVgoBg551BasYwtZBiRvLRgbztJYZANU7D2lWSEKuGUZC2OiwwZDZD';
 
let app = express();
app.use(bodyParser.json());
 
app.listen(3000, () => {
	console.log('server running in port 3000');
});
 
app.get('/', (req,res) => {
	res.send('Hi!');
});
 
app.get('/webhook', (req,res) => {
	if(req.query['hub.verify_token'] === 'test_bot_token'){
		res.send(req.query['hub.challenge']);
	}else{
		res.send('invalid token')
	};
});

app.post('/webhook', (req, res) => {
    let data = req.body;
    if(data.object == 'page'){
      data.entry.forEach(pageEntry => {
        pageEntry.messaging.forEach( messagingEvent => {
            if(messagingEvent.message){
                receiveMessage(messagingEvent);
            }
        });
      });
      res.sendStatus(200);
    }
});

let receiveMessage = (event) => {
    let senderId = event.sender.id,
        messageText = event.message.text;

    evaluateMessage(senderId, messageText);
}

let evaluateMessage = (recipientId, message) => {
    let finalMessage = '';
    console.log(message)

    if (isContain(message, 'ayuda')){
        finalMessage = '¿En que te puedo ayudar?'
    } else if(isContain(message.toLowerCase(), 'hola')){
        finalMessage = '¿Hola como estás?'
    } /*else if(isContain(message, 'imagen')){
        finalMessage = 'Una imagen:'
        sendMessageImage(recipientId);
    } else if(isContain(message, 'info')){
        sendMessageTemplate(recipientId);    
        //finalMessage = ':)'
    } else if(isContain(message, 'clima')){
        getWeather((temperature) => {
            message = getMessageWeather(temperature);
            sendMessageText(recipientId, message);
        });
    } else {
        finalMessage = 'No etiendo: ' + message;
    }
*/
    sendMessageText(recipientId, finalMessage);
}

let sendMessageText = (recipientId, message) => {
    let messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: message
        }
    }
    callSendAPI(messageData);
}

let sendMessageImage = (recipientId) => {
    //TODO: connect to UNSPLASH API
    let messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: 'image',
                payload: {
                    url: 'http://4.bp.blogspot.com/--tS8VcfoAmo/T6xsyeXCUYI/AAAAAAAAAN8/CG3yvySbfCM/s1600/grande.png'
                }
            } 
        }
    }
    callSendAPI(messageData);
}

let sendMessageTemplate = (recipientId) => {
    let messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    elements: [elementTemplate(), elementTemplate()]
                }

            }
        }
    }

    callSendAPI(messageData);
}

let elementTemplate = () => {
    return {
        title: 'dapino',
        subtitle: 'Bot template test',
        item_url: 'https://www.facebook.com/dapinoco/',
        image_url: 'http://4.bp.blogspot.com/--tS8VcfoAmo/T6xsyeXCUYI/AAAAAAAAAN8/CG3yvySbfCM/s1600/grande.png',
        buttons: [buttonTemplate(),buttonTemplate()],
    }
}

let buttonTemplate = () => {
    return{
        type: 'web_url',
        url: 'https://www.facebook.com/dapinoco/',
        title: 'botón'
    }
}

let getWeather = (callback) => {
    let geoNameAPI = 'http://api.geonames.org/findNearByWeatherJSON?lat=51.5033640&lng=-0.1276250&username=dapino';
    
    request(geoNameAPI, (err, res, data) => {
        if(!err){
            let response = JSON.parse(data),
                temperature = response.weatherObservation.temperature;
            
            callback(temperature);
        }
    })
}

let getMessageWeather = (temperature) => {
    if(temperature > 30){
        return `La temperatura es de ${temperature}°C, ¡Hace mucho Calor!`
    } else if (temperature < 10) {
        return `La temperatura es de ${temperature}°C, ¡Hace mucho Frío!`
    } else {
        return `La temperatura es de ${temperature}°C, ¡Feliz Día!`
    }
}

let isContain = (sentence, word) => {
    return sentence.indexOf(word) > -1;
}

let callSendAPI = (messageData) => {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: APP_TOKEN},
        method: 'POST',
        json: messageData
    }, (err,res,data) => {
        if (err) {
            //console.log(JSON.stringify(res))
            console.log('no se pudo enviar')
        } else {
            //console.log(JSON.stringify(res))
            console.log('ok');
        }
    })
}
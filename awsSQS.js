/**
 * Copyright 2014, 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
 module.exports = function(RED) {


    
    function sqsOutNode(config) {
        RED.nodes.createNode(this,config);
        this.name       = config.name ;
        this.groupId    = config.groupId ;
        this.url        = config.url ;
        this.payonly    = config.payonly || false;
        var AWS = require('aws-sdk');
        AWS.config.region = config.awsRegion || 'eu-west-1';
        
        var sqs = new AWS.SQS();
		
        var node = this;
        var context = this.context();
		
		node.on("input",function(msg) {
            node.log("message received") ;			
			var sendMsg = (this.payonly) ? msg.payload : msg ;
            if (typeof(sendMsg) == 'object') {
                sendMsg = JSON.stringify(sendMsg) ;
            }
            else if (typeof(sendMsg) != 'string') {
                node.error("cant send message of type " + typeof(sendMsg), msg) ;
            }
            var params = {} ;
            params.QueueUrl = node.url ;
            params.MessageBody = sendMsg ;
            if(node.groupId) {
                params.MessageGroupId = node.groupId ;
            }
            if(msg.MessageGroupId) {
                params.MessageGroupId = msg.MessageGroupId ;
            }
            if(params.MessageGroupId) {
                node.log("using MessageGroupId=" + params.MessageGroupId) ;	
            }
            sqs.sendMessage(params, function(err, data) {
                if (err) {
                    msg.error = err;
                    node.log('error'); 
                    node.error(err); // an error occurred
                } else {
                    msg.payload = data;
                    node.log('success');           // successful response
                }
                node.send(msg);
            });
        });
    }
    RED.nodes.registerType("sqs out",sqsOutNode);

    function sqsInNode(config) {
        RED.nodes.createNode(this,config);
        this.name       = config.name ;
        this.url        = config.url ;
        this.payonly    = config.payonly || false;
        var AWS = require('aws-sdk');
        AWS.config.region = config.awsRegion || 'eu-west-1';
        
        var sqs = new AWS.SQS();

		var node = this;
        var context = this.context();

        this.readHandler = function(err, data) {
            if (err) { 
                node.error(err) ;
                sqs.receiveMessage({
                        QueueUrl: node.url,
                        MaxNumberOfMessages: 1,
                        VisibilityTimeout: 60, // seconds  
                        WaitTimeSeconds: 5 // seconds 
                        }, node.readHandler) ;
            }
            else if (data.Messages) {
                node.log( "got messages") ;
                // Get the first message (should be the only one since we said to only get one above)
                var message = data.Messages[0] ;
                var body = message.Body;
                if (body.match(/^\s*[\[\{]/)) {
                    body = JSON.parse(message.Body);
                    node.log("matched json");
                }
                // Now this is where you'd do something with this message
                var msg = {} ;
                msg.payload = body ;
                node.send(msg);
                // Clean up after yourself... delete this message from the queue, so it's not executed again
                var params = {} ;
                params.QueueUrl = node.url ;
                params.ReceiptHandle = message.ReceiptHandle ;
                sqs.deleteMessage(params, function(err, data) {
                    if (err) node.error("error deleting sqs msg" + err);
                    sqs.receiveMessage({
                        QueueUrl: node.url,
                        MaxNumberOfMessages: 1,
                        VisibilityTimeout: 60, // seconds  
                        WaitTimeSeconds: 5 // seconds 
                        }, node.readHandler) ;
                }) ;
    
            }
            else {
                sqs.receiveMessage({
                    QueueUrl: node.url,
                    MaxNumberOfMessages: 1, // how many messages do we wanna retrieve?
                    VisibilityTimeout: 60, // seconds - how long we want a lock on this job
                    WaitTimeSeconds: 3 // seconds - how long should we wait for a message?
                }, node.readHandler) ;
            }
        } ;
		sqs.receiveMessage({
            QueueUrl: node.url,
            MaxNumberOfMessages: 1, // how many messages do we wanna retrieve?
            VisibilityTimeout: 60, // seconds - how long we want a lock on this job
            WaitTimeSeconds: 3 // seconds - how long should we wait for a message?
        }, node.readHandler) ;

		this.on("input",function(msg) {
            console.log("unexpected message received") ;			
			     
        });
    }

    RED.nodes.registerType("sqs in",sqsInNode);
    

};


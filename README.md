# node-red-contrib-aws-sqs

A pair of [Node-RED](http://nodered.org) nodes to send messages to and receive messages from
an [aws SQS](https://aws.amazon.com/sqs) queue.

Messages can be either javascript objects or strings. Objects are encoded as JSON before being sent. On reception of a message, the input node checks for JSON encoding and, if so, decodes the JSON string into a javascript object before forwarding.

configuration:


credentials: Should be available in a credentials file - ~/.aws/credentials on Mac/Linux or C:\Users\USERNAME\.aws\credentials on Windows

             You can use environment vars too.


settings.js: contains the following

   awsRegion: optional region setting default value 'eu-west-1'


Author
-------
Kieran Dolan (@kierandol)  

Contributor
-------
Gilbert Gonzalez (@gigonzalezs)

Issues
-------
https://github.com/gigonzalezs/node-red-contrib-aws-sqs.git

Copyright and license
----------------------
Copyright 2014, 2021 IBM Corp. under the [Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0).

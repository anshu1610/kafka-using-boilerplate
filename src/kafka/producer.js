import express from 'express';
import bodyParser from 'body-parser';
import kafka from 'kafka-node';
// var kafka = require("kafka-node");
import envVariables from '../envVariables';

var app = express();
// Code to handle JSON in our APIs
app.use(bodyParser.json());     // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

// Create a Kafka Producer
const Producer = kafka.Producer;
let client;
if (process.env.NODE_ENV === "development") {
    client = new kafka.KafkaClient();
    console.log("local Producer- ");
} else {
    client = new kafka.KafkaClient({ kafkaHost: envVariables.KAFKA_BROKER_HOST });
    console.log("cloud Producer- ");
}

const producer = new Producer(client);

// Event handler to know the state of our Producer
producer.on('ready', function () {
    console.log('Producer is ready');
});

producer.on('error', function (err) {
    console.log('Producer is in error state');
    console.log(err);
});

export default producer;
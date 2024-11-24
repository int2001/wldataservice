#!/usr/bin/env bun

const config = require("./config.js");
const express=require('express');
const app=express();
import dateFormat, { masks } from "dateformat";
const morgan = require('morgan');
const maidenhead = require('maidenhead');
const { find } = require('geo-tz');

app.use(express.urlencoded({ extended: true }));

morgan.token('remote-addr', function (req, res) {
	var ffHeaderValue = req.headers['x-forwarded-for'];
	return ffHeaderValue || req.connection.remoteAddress;
});

app.disable('x-powered-by');
if (config.logging) {
	app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'));
}

app.post(config.baseUrl+'/geocalc', async function(req, res) {	
	let response=loc2time(req.body.grid);
	res.status(response.status_code).send(response);
});

app.post(config.baseUrl+'/test', async function(req, res) {	
	let response={status:"success",status_code:200,data:{testvalue:true}};
	res.status(response.status_code).send(response);
});

function loc2time (loc) {
	let resp={};
	resp.data={};
	try {
		let cord=maidenhead.toLatLon(loc);
		let tz=find(cord[0],cord[1])[0];
		resp.data.timezone=tz;
		resp.data.latitude=cord[0];
		resp.data.longitude=cord[1];
		resp.data.zulu_time=dateFormat(new Date(),"UTC:yyyy-mm-dd HH:MM:ss");
		resp.data.local_time=dateFormat(convertTZ(new Date(),tz),"yyyy-mm-dd HH:MM:ss");
		resp.status='success';
		resp.status_msg='Timezone found and local time calculated';
		resp.status_code=200;
	} catch (e) {
		console.log("Error / Wrong request with Loc: "+loc);
		resp.status='error';
		resp.status_msg=e;
		resp.status_code=400;
	} finally {
		return resp;
	}
}

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

app.listen(config.port, () => {
	console.log('listener started on Port '+config.port);
});

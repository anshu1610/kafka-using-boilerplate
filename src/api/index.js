import { version } from "../../package.json";
import { Router, response } from "express";
import producer from '../kafka/producer';
import Ajv from "ajv";
import task from "../model/task";
import envVariables from "../envVariables.js";
var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

var asyncHandler = require('express-async-handler');

export const createApiResponse = async (bodly, req, res = {}) => {
  let payloads = [];

  console.log('#Enter into createApiResponse');


  payloads.push({
    topic: envVariables.KAFKA_TOPICS_FIRST_TOPIC,
    messages: JSON.stringify(bodly),
  });

  console.log('#payloads', payloads);

  const producerResponse = producer.send(payloads, (err, data) => {
    // res.json(data);
    return data;
  });
  console.log(producerResponse);

  return producerResponse;
};

export default ({ config, db }) => {
  let api = Router();

  api.get("/search", (req, res) => {
    db.query(`SELECT * FROM ams_test_table`, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response.rows);
        res.json({ tableDetails: response.rows });
      }
    });
  });

  api.post("/create", asyncHandler(async (req, res) => {
    const { country, state, city, locality, pincode, latitude, longitude, is_active, additional_details, created_by } = req.body;
    const uuidv1 = require("uuid/v1");
    const uuid = uuidv1();
    // const created_by = 'Anshu';
    const created_time = new Date().getTime();
    console.log('Hitting API');

    // let apiResponse = await createApiResponse(({body}, res));
    // let apiResp = await createApiResponse({ body }, res, next);
    let apiRes = await createApiResponse(req.body, req, res);
    console.log('#Outside of createApiResponse');

    db.query(`INSERT into ams_test_table (uuid, country, state, city, locality, pincode, latitude, longitude, is_active, additional_details, created_by, created_time) VALUES ('${uuid}', '${country}', '${state}', '${city}', '${locality}', ${pincode}, ${latitude}, ${longitude}, true, null, '${created_by}', ${created_time})`, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(res.rows);
        res.json({ status: "Successful" });
      }
    });
  }));


  api.put("/update/:id", (req, res) => {
    const { country, state, city, locality, pincode, latitude, longitude, is_active, additional_details, updated_by } = req.body;
    const { id } = req.params;
    // const created_by = 'Anshu';
    const updated_time = new Date().getTime();
    db.query(`UPDATE ams_test_table SET country = '${country}', state = '${state}', city = '${city}', locality = '${locality}', pincode = ${pincode}, latitude = ${latitude}, longitude = ${longitude}, updated_by = '${updated_by}', updated_time= ${updated_time} WHERE uuid='${id}'`, (err, response) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(res.rows);
        res.json({ status: "Successful" });
      }
    });
  });




  // api.get("/task", (req, res) => {

  //   //find id in task table and return the task
  //   db.query("SELECT * from tasks", (err, response) => {
  //     if (err) {
  //       console.log(err.stack);
  //     } else {
  //       console.log(response.rows);
  //       res.json({ tasks: response.rows });
  //     }
  //   });
  // });


  // perhaps expose some API metadata at the root
  // api.get("/task/:id", (req, res) => {
  //   //find id in task table and return the task
  //   db.query(`SELECT * from task where id=${req.params.id}`, (err, response) => {
  //     if (err) {
  //       console.log(err.stack);
  //     } else {
  //       console.log(response.rows);
  // 			res.json({"companies":response.rows});
  //     }
  //   });
  // });

  // api.post("/task", (req, res,next) => {
  //   //take task from req and insert into task table
  //   console.log("body", req.body);
  //   var validate = ajv.compile(task);
  //   var valid = validate(req.body);
  //   if (!valid)
  //   {
  //      console.log(validate.errors);
  //      return next({Errors:validate.errors});
  //   }
  //   const { name } = req.body;
  //   const uuidv1 = require("uuid/v1");
  //   const id = uuidv1();
  //   const createdBy = "200";
  //   const createTime = new Date().toJSON();
  //   db.query(
  //     `insert into tasks values('${id}','${name}',false,'${createdBy}','${createTime}')`,
  //     (err, response) => {
  //       if (err) {
  //         console.log(err.stack);
  //       } else {
  //         console.log(response.rows);
  //         res.json({ status: "successfull"});
  //       }
  //     }
  //   );
  // });


  // api.put("/task/:id", (req, res) => {
  //   console.log("req", req.params);
  //   console.log("body", req.body);
  //   console.log("body", req.body);
  //   const { id } = req.params;
  //   const { status } = req.body;
  //   const updatedBy = "200";
  //   const updateTime = new Date().toJSON();
  //   db.query(
  //     `UPDATE tasks
  // SET status=true,"updatedBy"='${updatedBy}', "updatedTime"='${updateTime}'
  // WHERE id='${id}'`,
  //     (err, response) => {
  //       if (err) {
  //         console.log(err.stack);
  //       } else {
  //         console.log(response.rows);
  //         res.json({ status: "successfull" });
  //       }
  //     }
  //   );
  // });


  // api.delete("/task/:id", (req, res) => {
  //   console.log("req", req.params);
  //   console.log("body", req.body);
  //   console.log("body", req.body);
  //   const {id}=req.params
  //   const {status}=req.body;
  //   const updatedBy="200";
  //   const updateTime=new Date().toJSON();
  //   db.query(`update tasks set status=${status} updatedBy=${updatedBy} updateTime=${updateTime} where id=${id}`, (err, response) => {
  //     if (err) {
  //       console.log(err.stack);
  //     } else {
  //       console.log(response.rows);
  //       res.json({"status":"successfull","response":response.rows});
  //     }
  //   });
  // });


  // Perhaps expose some API metadata at the root
  api.get("/", (req, res) => {
    res.json({ version });
  });
  return api;
};


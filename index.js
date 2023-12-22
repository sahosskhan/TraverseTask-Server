const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 8000

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
// collection
const TaskCollection = client.db("TaskAppDB").collection("AllTasks");
const UserCollection = client.db("TaskAppDB").collection("AllAppUsers");

// task post request
    app.post("/added-tasks", async (req, res) => {
        try {
         const PostedTaskData = req.body;
         console.log(PostedTaskData);
         const result = await TaskCollection.insertOne(PostedTaskData);
         res.send(result);
        }
         catch (error) {
           console.log(error);
         
        }
       });

// user add post request
app.post("/app-users", async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  const existingUser = await UserCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: "User already exists", insertedInd: null });
  }
  const result = await UserCollection.insertOne(user);
  res.send(result);
});


// get all task by get request
app.get("/show-all-task", async (req, res) => {
  const result = await TaskCollection.find().toArray();
  res.send(result);
});
// get all task by get request
app.get("/user-list", async (req, res) => {
  const result = await UserCollection.find().toArray();
  res.send(result);
});
// task delete request
app.delete("/task-delete/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await TaskCollection.deleteOne(query);
  res.send(result);
});
// task ongoing status update
app.patch("/task-ongoing/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id)};
  const updatedDoc = {
    $set:{
      taskStatus: "ongoing",
    },
  }
  const result = await TaskCollection.updateOne(filter,updatedDoc);
  console.log(result);
  res.send(result);
  
});

// task complete status update
app.patch("/task-complete/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id)};
  const updatedDoc = {
    $set:{
      taskStatus: "completed",
    },
  }
  const result = await TaskCollection.updateOne(filter,updatedDoc);
  console.log(result);
  res.send(result);
  
});
// get request for get single task
app.get("/task-update/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await TaskCollection.findOne(query);
  res.send(result);
});

// update single task all data

app.put("/updatedTask/:id", async (req, res) =>{
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateContent = req.body;
  const content = {
    $set: {
      creatorName:updateContent.creatorName,
       creatorEmail:updateContent.creatorEmail,
       taskTitle:updateContent.taskTitle,
       taskDeadline:updateContent.taskDeadline,
       taskPriority:updateContent.taskPriority,
       taskDetails:updateContent.taskDetails,
       taskStatus:updateContent.taskStatus,
    },
  };
  const result = await TaskCollection.updateOne(
    filter,
    content,
    options
  );
  res.send(result);
});


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://traversetask.web.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});






    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello from Task Management Server..')
})

app.listen(port, () => {
  console.log(`Task Management is running on port ${port}`)
})

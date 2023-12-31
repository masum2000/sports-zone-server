const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster2.p1tk2ky.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

   const usersCollection = client.db("sportsZoneDb").collection("users");
   const classesCollection = client.db("sportsZoneDb").collection("classes");
   const instructorsCollection = client.db("sportsZoneDb").collection("instructors");
   const reviewsCollection = client.db("sportsZoneDb").collection("reviews");
   const cartCollection = client.db("sportsZoneDb").collection("carts");


  app.post('/jwt', (req,res)=>{
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
    res.send({ token });
  })



//    users related apis

  app.get('/users', async (req, res) => {
    const result = await usersCollection.find().toArray();
    res.send(result);
  })


  app.post('/users', async (req, res) => {
    const user = req.body;
    console.log(user);
    const query = {email: user.email}
    const existingUser = await usersCollection.findOne(query);
    console.log('existing user',existingUser);
    if(existingUser) {
        return res.send({message: 'user already exists'})
    }
    const result = await usersCollection.insertOne(user);
    res.send(result);
  });

//   create an admin 
   app.patch('/users/admin/:id', async(req, res) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const updateDoc = {
        $set: {
            role: 'admin'
        },
    };

    const result = await usersCollection.updateOne(filter, updateDoc);
    res.send(result);
   })

//    user delete
app.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id) };
    const result = await usersCollection.deleteOne(query);
    res.send(result);
});


//   classes related apis
   app.get('/classes', async (req, res) => {
    const result = await classesCollection.find().toArray();
    res.send(result);
   })

// instructors related apis
   app.get('/instructors', async (req, res) => {
    const result = await instructorsCollection.find().toArray();
    res.send(result);
   })

// reviews related apis
   app.get('/reviews', async (req, res) => {
    const result = await reviewsCollection.find().toArray();
    res.send(result);
   });

//cart collection
    app.get('/carts', async (req, res) => {
        const email = req.query.email;
        if(!email){
            res.send([]);
        }
        const query = {email: email};
        const result = await cartCollection.find(query).toArray();
        res.send(result);
    })

    app.post('/carts', async (req,res) => {
        const item =  req.body;
        console.log(item);
        const result = await cartCollection.insertOne(item);
        res.send(result);
    });
   
    app.delete('/carts/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id) };
        const result = await cartCollection.deleteOne(query);
        res.send(result);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('summer seekers is running')
})

app.listen(port, () => {
    console.log(`Summer Seekers is running on port ${port}`);
})
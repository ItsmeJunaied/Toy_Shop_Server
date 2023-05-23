const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zj6nics.mongodb.net/?retryWrites=true&w=majority`;

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

    const herotoycollection = client.db('herotoyDB').collection('herotoy');

    const indexkeys={name :1, categoty:1};

    const indexOption={name : 'titleCategory'}

    const result = await herotoycollection.createIndex(indexkeys, indexOption);

    app.get("/toy/:text", async (req, res) => {
      const searchText = req.params.text;
    
      const result = await herotoycollection
        .find({
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { category: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });
    

    app.get('/toy', async (req, res) => {
      const email = req.query.email;
      const categoty = req.query.categoty;
      let query = {};
    
      if (email) {
        query.email = email;
      }
    
      if (categoty) {
        query.categoty= categoty;
      }
    
      const result = await herotoycollection.find(query).toArray();
      res.send(result);
    });
    

    
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const option = {
        projection: { name: 1, categoty: 1, sname: 1, email: 1, price: 1, rating: 1, quantity: 1, detail: 1, photo: 1 },

      };
      const result = await herotoycollection.findOne(query, option);
      res.send(result);
    })
    
    

    // email data

    

    // update
    app.put('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedToy=req.body;
      const toy = {
        $set: {
          name: updatedToy.name,
          categoty: updatedToy.categoty,
          sname: updatedToy.sname,
          email: updatedToy.email,
          price: updatedToy.price,
          rating: updatedToy.rating,
          quantity: updatedToy.quantity,
          detail: updatedToy.detail,
          photo: updatedToy.photo
        }
      }
      const result =await herotoycollection.updateOne(filter,toy,);
      res.send(result);
    })

    app.post('/toy', async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await herotoycollection.insertOne(newToy);
      res.send(result);
    })

    // delete
    app.delete('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await herotoycollection.deleteOne(query);
      res.send(result);
    })
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
  res.send('Toy Hero is running')
})

app.listen(port, () => {
  console.log(`Toy Hero Server is running on port: ${port}`)
})
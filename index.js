const express = require('express')
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()


//middleware
app.use(cors())
app.use(express.json())

// https://quiet-refuge-83525.herokuapp.com/

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.doriy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productCollection = client.db("products").collection("items");
        console.log('db connected');

        app.get('/inventory', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            console.log();
            const query = { _id: ObjectId(id) };
            const item = await productCollection.findOne(query);
            res.send(item);
        })

        //update
        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updateItem = req.body;
            console.log(updateItem.sold);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    sold: updateItem.sold,
                },
            };
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Running pharmabd server!')
})

app.listen(port, () => {
    console.log(`Pharmabd server is listening on port ${port}`)
})
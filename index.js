const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

        // get token from user email
        app.post('/login', async (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
            res.send({ token });
        })

        // get items
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await productCollection.findOne(query);
            res.send(item);
        })

        // add item
        app.post('/inventory', async (req, res) => {
            const data = req.body;
            const item = await productCollection.insertOne(data);
            res.send(item);
        })

        // deleting items
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await productCollection.deleteOne(query);
            res.send(item);
        })

        //update items
        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updateItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    quantity: updateItem.quantity,
                    sold: updateItem.sold,
                },
            };
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        // getting items for my items
        app.get('/myItems', async (req, res) => {
            const data = req.headers.authorization
            const email = data.split(' ')[0];
            const accessToken = data.split(' ')[1];
            const decoded = verifyToken(accessToken);
            if (email === decoded.email) {
                const query = { email: email }
                const cursor = productCollection.find(query);
                const products = await cursor.toArray();
                res.send(products)
            } else {
                res.status(401).send({ message: 'unAuthorized Access' })
            }
        })
        // getting items for my items
        app.delete('/myItems/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const item = await productCollection.deleteOne(query);
            res.send(item);
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

// verify token function
function verifyToken(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            email = `Invalid email`;
        }
        if (decoded) {
            email = decoded;
        }
    });
    return email;
} 
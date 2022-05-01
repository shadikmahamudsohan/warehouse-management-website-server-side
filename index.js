const express = require('express')
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()

// test push for heroku

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.doriy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productCollection = client.db("products").collection("items");
        console.log('db connected');

        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        const item = {
            name: 'Napa 500',
            email: 'user001@gmail.com',
            supplierName: 'napa company',
            sold: '32000',
            quantity: '300',
            price: '50',
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHrs77ThPSiRHLOW7IEGaemRHJe71QJmV85NKfRD0Az3b5ofe0Od_k&usqp=CAE&s',
            description: 'This is a medicine for pain, bug bite and fiver.'
        }
        const result = await productCollection.insertOne(item)
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


//middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Running pharmabd server!')
})

app.listen(port, () => {
    console.log(`Pharmabd server is listening on port ${port}`)
})
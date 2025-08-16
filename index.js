const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const stripe = require('stripe')(`${process.env.STRIPE_SECRET}`);

app.use(express.json());
const corsOptions = {
  origin: 'https://stripe-store-lake.vercel.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
  credentials: true, 
};

app.use(cors());

app.get('/checkout', (req, res) => {
    res.send('Hello World');
});

app.post('/checkout', async (req, res) => {

   try{
        const products = req.body;

        const line_items = products.map(product => ({ //create a new array of line_items
            price_data: {
                currency: 'usd',
                product_data: {
                    name: product.title,
                    images: [product.image],
                },
                unit_amount: Math.round(product.price * 100),
            },
            quantity: product.quantity || 1, 
            
        }));

        const session = await stripe.checkout.sessions.create({ //create a new session with the line_items
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/?success=true`,
            cancel_url: `${process.env.CLIENT_URL}/?canceled=true`,
        });

        res.json({ id: session.id }); //send the session id to the client
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    
    }
});

app.listen(3000, () => {    
    console.log('Server is running on http://localhost:3000');
});
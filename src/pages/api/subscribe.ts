import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from 'next-auth/react';
import { stripe } from "../../services/stripe";

export default async (req: NextApiRequest, response: NextApiResponse) => {
    if (req.method == 'POST') {

        const session = await getSession ({ req })

        const stripeCustomer = await stripe.customers.create({
            email: session.user.email,
            // metadata
        })
    
        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomer.id,
            payment_method_types: ['card'],
            billing_address_collection: 'required', // Address
            line_items: [
                { price: 'price_1LWU1UKHGhtRnBbeu1dCdc86', quantity: 1}
            ],
            mode: 'subscription',
            allow_promotion_codes: true, // Coupon
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL
        })

        response.end()
        return response.status(200).json({ sessionId: stripeCheckoutSession.id})
    } else {
        response.setHeader('Allow', 'POST')
        response.status(405).end('Method not allowed')
    }
}

import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]"

import { getSession } from 'next-auth/react';
import { stripe } from "../../services/stripe";

export default async (request: NextApiRequest, response: NextApiResponse) => {
    if (request.method == 'POST') {

        const session = await unstable_getServerSession(request, response, authOptions)

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

function authOptions(arg0: { request: NextApiRequest; response: NextApiResponse<any>; }, authOptions: any) {
    throw new Error("Function not implemented.");
}

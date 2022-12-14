import { signIn, useSession } from 'next-auth/react';
import Router, { useRouter } from 'next/router';
import { api } from '../../services/api';
import { stripe } from '../../services/stripe';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';

interface SubscribeButtonProps {
    priceId: string;
}

export function SubscribeButton({priceId}: SubscribeButtonProps) {
    
    const { data: session} = useSession();
    const roter = useRouter()
    
    async function handleSubscribe(){
        if(!session){
            signIn('github');
            return;
        }

        if (session.activeSubscription) {
            Router.push('/posts');

            return;
        }
        
        try {
            const response = await api.post('/subscribe')

            const { sessionId } = response.data;

            const stripe = await getStripeJs()

            await stripe.redirectToCheckout({ sessionId })

            console.log(stripe)

            console.log(sessionId)

        } catch (err) {

            alert(err.message);
        }

    }

    return(
        <button
            type="button"
            className={styles.subscribeButton}
            onClick={() => handleSubscribe()}
        >

            Subscribe Now
        </button>
    );
}
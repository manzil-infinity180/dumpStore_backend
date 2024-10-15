import dotenv from "dotenv";
import { Request, Response } from "express";
dotenv.config();
import { Stripe } from "stripe";
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Stripe api key is undefined");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const stripePaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      throw new Error("Price of the donation is not mentioned");
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};

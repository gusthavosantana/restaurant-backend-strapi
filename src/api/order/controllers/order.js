'use strict';

/**
 *  order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const stripeSecretKey = 'sk_test_51L6i1wGDi1ytWaob7R0EMmFHBG9Y0LzGDnd7cushQkduFJhoWhGLavCj6uOXEgW1l5OkF9RWRFnfyqgLHAP77Ko000kSjXsncH';
const stripe = require('stripe')(stripeSecretKey);

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    const { address, amount, dishes, token, city, state } = JSON.parse(ctx.request.body);
    const stripeAmount = Math.floor(amount * 100);

    // charge on stripe
    const charge = await stripe.charges.create({
      // Transform cents to dollars.
      amount: stripeAmount,
      currency: "usd",
      description: `Order ${new Date()} by ${ctx.state.user._id}`,
      source: token,
    });

    // Register the order in the database
    const order = await strapi.service('api::order.order').create({
      data: {
        user: ctx.state.user.id,
        charge_id: charge.id,
        amount: stripeAmount,
        address,
        dishes,
        city,
        state,
      }
    });

    return order;
  },
}));

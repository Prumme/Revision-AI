<template>
  <div>
    <div ref="cardElement" class="card-element"></div>
    <button @click="submitPaymentMethod">Submit Payment Method</button>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { loadStripe } from "@stripe/stripe-js";

const cardElement = ref(null);
const errorMessage = ref("");

let stripe;
let card;

onMounted(async () => {
  stripe = await loadStripe(
    "pk_test_51RXLRGPK9ltfb6kbBwDbGkiAJG4wDDjSVS7kGnovrqzQnglpc4uOUlp2XOVL1vI5txShBmo4pomwBRnY76fP510000bGMPAWnG",
  );

  if (!stripe) {
    errorMessage.value = "Stripe failed to initialize.";
    return;
  }

  const elements = stripe.elements();
  card = elements.create("card");
  card.mount(cardElement.value);

  card.on("change", (event) => {
    errorMessage.value = event.error?.message || "";
  });
});

const submitPaymentMethod = async () => {
  if (!stripe || !card) {
    errorMessage.value = "Stripe is not initialized.";
    return;
  }

  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: "card",
    card: card,
  });

  if (error) {
    errorMessage.value = error.message;
  } else {
    console.log("✅ PaymentMethod ID:", paymentMethod.id);
    // TODO: Envoyer paymentMethod.id à votre backend
  }
};
</script>

<style scoped>
.card-element {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}
.error-message {
  color: red;
}
</style>

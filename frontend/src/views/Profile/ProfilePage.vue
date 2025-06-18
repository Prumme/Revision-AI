<script setup lang="ts">
import FormCard from "@/components/forms/cards/FormCard.vue";
import Input from "@/components/inputs/InputComponent.vue";
import ProfilePicture from "@/components/profile/ProfilePicture.vue";
import PasswordChangeCard from "@/components/cards/PasswordChangeCard.vue";
import DeleteAccountCard from "@/components/cards/DeleteAccountCard.vue";
import { useUserStore } from "@/stores/user";
import { useToastStore } from "@/stores/toast";
import { ref, computed, watch } from "vue";

const userStore = useUserStore();
const { showToast } = useToastStore();
const isLoading = ref(false);
const errorMessage = ref("");

// Valeurs initiales basées sur le store
const initialValues = {
  username: userStore.user?.username || "",
  email: userStore.user?.email || "",
  bio: userStore.user?.bio || "",
};

// Références pour les champs du formulaire
const username = ref(initialValues.username);
const email = ref(initialValues.email);
const bio = ref(initialValues.bio);

// Computed property pour vérifier si le formulaire a été modifié
const isDirty = computed(() => {
  return (
    username.value !== initialValues.username ||
    email.value !== initialValues.email ||
    bio.value !== initialValues.bio
  );
});

// Réinitialiser les valeurs si l'utilisateur change dans le store
watch(
  () => userStore.user,
  (newUser) => {
    if (newUser) {
      initialValues.username = newUser.username || "";
      initialValues.email = newUser.email || "";
      initialValues.bio = newUser.bio || "";

      username.value = initialValues.username;
      email.value = initialValues.email;
      bio.value = initialValues.bio;
    }
  },
  { deep: true },
);

const handleSubmit = async () => {
  if (!isDirty.value) return;

  try {
    isLoading.value = true;
    errorMessage.value = "";

    const updatedUser = await userStore.updateUser({
      username: username.value,
      email: email.value,
      bio: bio.value,
    });

    // Mettre à jour les valeurs initiales avec les nouvelles valeurs
    initialValues.username = updatedUser.username;
    initialValues.email = updatedUser.email;
    initialValues.bio = updatedUser.bio || "";

    showToast("success", "Profil mis à jour avec succès !");
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    errorMessage.value = "Une erreur est survenue lors de la mise à jour du profil";
    showToast("error", "Erreur lors de la mise à jour du profil");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <section class="flex flex-col gap-1.5 w-full">
    <p class="font-outfit text-lg text-black-transparent">
      Modifiez vos informations personnelles et vos préférences de compte.
    </p>
    <h1 class="font-outfit text-4xl font-extrabold text-black">
      Content de vous revoir <span class="text-primary">{{ userStore.user?.username }}</span> !
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
      <FormCard>
        <template #title> Vos informations personnelles </template>

        <template #content>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 space-y-5">
            <div class="flex items-center justify-center">
              <ProfilePicture />
            </div>

            <div class="flex flex-col gap-4">
              <Input
                v-model="username"
                label="Nom d'utilisateur"
                placeholder="Votre nom d'utilisateur"
              />
              <Input
                v-model="email"
                label="Email"
                placeholder="exemple@mail.com"
                type="email"
                disabled
              />
              <Input
                v-model="bio"
                label="Biographie"
                placeholder="Parlez un peu de vous..."
                type="textarea"
              />
              <button
                @click="handleSubmit"
                :disabled="isLoading || !isDirty"
                class="mt-4 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? "Mise à jour en cours..." : "Sauvegarder les modifications" }}
              </button>
              <p v-if="errorMessage" class="mt-2 text-red-500 text-sm">{{ errorMessage }}</p>
            </div>
          </div>
        </template>
      </FormCard>

      <div class="flex flex-col gap-4">
        <PasswordChangeCard />
      </div>

      <DeleteAccountCard />
    </div>
  </section>
</template>

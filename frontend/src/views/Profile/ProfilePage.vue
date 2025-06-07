<script setup lang="ts">
import FormCard from "@/components/forms/cards/FormCard.vue";
import Input from "@/components/inputs/InputComponent.vue";
import ProfilePicture from "@/components/profile/ProfilePicture.vue";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";

const { user, getFullName } = useUserStore();

const firstname = ref(user?.firstname || "");
const lastname = ref(user?.lastname || "");
const email = ref(user?.email || "");
const bio = ref(user?.bio || "");
</script>

<template>
  <section class="flex flex-col gap-1.5 w-full">
    <p class="font-outfit text-lg text-black-transparent">
      Modifiez vos informations personnelles et vos préférences de compte.
    </p>
    <h1 class="font-outfit text-4xl font-extrabold text-black">
      Content de vous revoir <span class="text-primary"> {{ getFullName() }}</span> !
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
      <FormCard>
        <template #title>
          <h1 class="font-outfit text-lg text-black-transparent mb-4">
            Vos informations personnelles
          </h1>
        </template>

        <template #content>
          <div class="grid grid-cols-2 gap-2 space-y-5">
            <div class="flex items-center justify-center">
              <ProfilePicture
                :src="user?.profilePicture || '../../assets/profile_picture/monkey.jpg'"
                alt="Profile Picture"
              />
            </div>

            <div class="flex flex-col gap-4">
              <Input v-model="firstname" label="Prénom" placeholder="Votre prénom" />
              <Input v-model="lastname" label="Nom" placeholder="Votre nom de famille" />
              <Input v-model="email" label="Email" placeholder="exemple@mail.com" type="email" />
              <Input
                v-model="bio"
                label="Biographie"
                placeholder="Parlez un peu de vous..."
                type="textarea"
              />
            </div>
          </div>
        </template>
      </FormCard>
    </div>
  </section>
</template>

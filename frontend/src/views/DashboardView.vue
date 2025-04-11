<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import type { User } from "@/types/user.ts";

const { setUser, getFullName } = useUserStore();

const user: User = {
  id: "1212",
  firstname: "John",
  lastname: "Smith",
  email: "john.smith@mail.fr",
};

setUser(user);
</script>

<template>
  <div>
    <h1 class="font-encode text-4xl font-black">Bienvenue {{ getFullName() }}</h1>
  </div>
</template>

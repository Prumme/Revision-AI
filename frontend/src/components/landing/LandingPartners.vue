<script setup lang="ts">
import esgiLogo from "@/assets/partners/esgi.png";
import icanLogo from "@/assets/partners/ican.png";
import ppaLogo from "@/assets/partners/ppa.png";
import ecitvLogo from "@/assets/partners/ecitv.png";
</script>

<template>
  <section id="partenaires" class="py-16 bg-blue-light">
    <div class="max-w-5xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-encode font-bold text-black text-center mb-10">
        Ils nous font <span class="text-primary">confiance</span> !
      </h2>
      <div class="flex flex-wrap justify-center items-center gap-8 md:gap-22">
        <img
          :src="esgiLogo"
          alt="ESGI"
          class="w-42 h-22 object-contain transition-all duration-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
        />
        <img
          :src="icanLogo"
          alt="ICAN"
          class="w-48 h-28 object-contain transition-all duration-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
        />
        <img
          :src="ppaLogo"
          alt="PPA"
          class="w-42 h-22 object-contain transition-all duration-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
        />
        <img
          :src="ecitvLogo"
          alt="ECITV"
          class="w-42 h-22 object-contain transition-all duration-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
        />
      </div>
    </div>
  </section>
</template>

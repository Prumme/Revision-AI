<script setup lang="ts">
import  NavLink from "@/components/buttons/NavLink.vue";

</script>

<template>
    <main class="w-screen h-screen flex ">
        <nav class="w-86 h-full bg-background-alt text-foreground-alt">
            <div class="px-7 pt-14 font-outfit flex flex-col gap-3">
                <NavLink to="/home" icon="House" text="Accueil" :active="true" />
                <NavLink to="/exams" icon="FileQuestion" text="Quiz" :active="false" />
                <NavLink to="/courses" icon="File" text="Documents" :active="false" />
            </div>
        </nav>
        
        <div class="w-full h-full overflow-scroll bg-background text-foreground p-4">
            <router-view></router-view>
        </div>
    </main>
</template>
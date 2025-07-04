<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { loginUser } from "$lib/api/user";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { notifyByLevel, success } from "$lib/toast/toast";
  import { cn } from "$lib/utils.js";
  import { goto } from "$lib/utils/goto";
  import preventDefault from "$lib/utils/preventDefault";
  import { Loader } from "lucide-svelte";

  let className: string | undefined | null = undefined;
  export { className as class };

  let isSubmitting = false;
  let email = "";
  let password = "";
  let rememberMe = false;

  async function onSubmit() {
    isSubmitting = true;
    try {
      const response = await loginUser(email, password, rememberMe);
      console.log("User logged in successfully:", response);
      success("Connexion réussie !", "Vous êtes maintenant connecté.");
      goto("/");
    } catch (error) {
      console.error("Error logging in user:", error);
      const errorData = error.response?.data || {};
      const status = error.response?.status;

      let title = "Erreur lors de la connexion";
      let level: "warning" | "error" = errorData.level || "error";
      let message = errorData.messageDisplay || "Une erreur est survenue";

      if (status === 400) {
        message = "Requête invalide. Vérifiez vos identifiants et réessayez.";
      }

      notifyByLevel({ title, level, message });
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class={cn("grid gap-6", className)}>
  <form onsubmit={preventDefault(onSubmit)}>
    <div class="grid gap-2">
      <div class="grid gap-1">
        <Label class="sr-only" for="email">Email</Label>
        <Input
          id="email"
          placeholder="nom@example.com"
          type="email"
          autocapitalize="none"
          autocomplete="email"
          autocorrect="off"
          bind:value={email}
          disabled={isSubmitting}
        />
        <Label class="sr-only" for="password">Password</Label>
        <Input
          id="password"
          placeholder="Password"
          type="password"
          bind:value={password}
          disabled={isSubmitting}
        />
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <Checkbox
            id="terms"
            bind:checked={rememberMe}
            aria-labelledby="terms-label"
          />
          <Label
            id="terms-label"
            for="terms"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Se souvenir de moi
          </Label>
        </div>
        <Button
          href="/forgot-password"
          variant="ghost"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Mot de passe oublié ?
        </Button>
      </div>
      <Button
        class="bg-[#61A0AF] dark:text-white"
        type="submit"
        disabled={isSubmitting}
      >
        {#if isSubmitting}
          <Loader class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        Se connecter
      </Button>
    </div>
  </form>
  <div class="relative">
    <div class="absolute inset-0 flex items-center">
      <span class="w-full border-t"></span>
    </div>
    <div class="relative flex justify-center text-xs uppercase">
      <span
        class="bg-background dark:bg-gray-900 text-muted-foreground px-2 dark:text-white"
      >
        Ou continuer avec
      </span>
    </div>
  </div>
  <div class="flex gap-1 w-full">
    <Button
      class="w-full"
      variant="outline"
      type="button"
      disabled={isSubmitting}
      href={env.PUBLIC_API_OAUTH_GOOGLE_URL}
    >
      {#if isSubmitting}
        <Loader class="mr-2 h-4 w-4 animate-spin" />
      {/if}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="30"
        height="30"
        viewBox="0 0 48 48"
      >
        <path
          fill="#fbc02d"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12    s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20    s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        ></path><path
          fill="#e53935"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039    l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        ></path><path
          fill="#4caf50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36    c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        ></path><path
          fill="#1565c0"
          d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571    c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        ></path>
      </svg>
      Google
    </Button>
    <Button
      class="w-full"
      variant="outline"
      type="button"
      disabled={isSubmitting}
      href={env.PUBLIC_API_OAUTH_GITHUB_URL}
    >
      {#if isSubmitting}
        <Loader class="mr-2 h-4 w-4 animate-spin" />
      {/if}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="31"
        height="31"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M12 0C5.37 0 0 5.373 0 12a12 12 0 008.205 11.385c.6.113.82-.258.82-.577v-2.232c-3.338.726-4.033-1.416-4.033-1.416-.546-1.388-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.204.085 1.837 1.237 1.837 1.237 1.07 1.833 2.807 1.303 3.492.996.108-.775.419-1.303.762-1.602-2.665-.303-5.466-1.334-5.466-5.933 0-1.312.468-2.384 1.235-3.222-.123-.303-.535-1.522.117-3.176 0 0 1.008-.322 3.3 1.23a11.42 11.42 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.289-1.552 3.295-1.23 3.295-1.23.655 1.654.243 2.873.12 3.176.77.838 1.234 1.91 1.234 3.222 0 4.61-2.806 5.626-5.478 5.922.43.372.823 1.102.823 2.222v3.293c0 .322.216.694.825.576A12.005 12.005 0 0024 12c0-6.627-5.373-12-12-12z"
        />
      </svg>
      GitHub
    </Button>
  </div>
</div>

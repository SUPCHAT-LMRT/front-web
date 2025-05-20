<script lang="ts">
  import { requestForgotPassword } from "$lib/api/user";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { error, notifyByLevel, success } from "$lib/toast/toast";
  import { cn } from "$lib/utils.js";
  import preventDefault from "$lib/utils/preventDefault";
  import { Loader } from "lucide-svelte";

  let className: string | undefined | null = undefined;
  export { className as class };

  let isSubmitting = false;
  let email = "";

  async function onSubmit() {
    isSubmitting = true;
    try {
      if (!email) {
        error("Email requis", "Veuillez entrer votre adresse email.");
        return;
      }
      await requestForgotPassword(email);
      success("Email envoyé", "Un email a été envoyé à votre adresse.");
    } catch (error) {
      const errorData = error.response?.data || {};
      const status = error.response?.status;

      let title = "Erreur de l'envoi de l'email";
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
          required
          bind:value={email}
          disabled={isSubmitting}
        />
      </div>
      <Button
        class="bg-[#61A0AF] dark:text-white"
        type="submit"
        disabled={isSubmitting}
      >
        {#if isSubmitting}
          <Loader class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        Continuer
      </Button>
    </div>
  </form>
</div>

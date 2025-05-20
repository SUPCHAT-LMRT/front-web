<script>
  import { Button } from "$lib/components/ui/button";
  import { ArrowLeft, Moon, Sun } from "lucide-svelte";
  import { toggleMode } from "mode-watcher";
  import Form from "./form.svelte";
</script>

<Button
  variant="outline"
  size="icon"
  class="absolute top-4 left-4"
  onclick={() => {
    window.history.back();
  }}
>
  <ArrowLeft class="size-4" />
</Button>

<div
  class="container flex flex-col min-h-screen items-center justify-center z-10"
>
  <div class="pl-32">
    <div
      class="mx-auto flex w-full flex-col justifier-center space-y-6 sm:w-[350px]"
    >
      <div class="flex flex-col space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">
          Mot de passe oublié
        </h1>
      </div>
      <Form />
      <p class="text-muted-foreground px-8 text-center text-sm">
        Vous recevrez un email contenant un lien pour réinitialiser votre mot de
        passe.
      </p>
    </div>
  </div>

  <Button
    onclick={toggleMode}
    variant="outline"
    size="icon"
    class="absolute bottom-4 right-4"
  >
    <Sun
      class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
    />
    <Moon
      class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
    />
    <span class="sr-only">Toggle theme</span>
  </Button>
</div>

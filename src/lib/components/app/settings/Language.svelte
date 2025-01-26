<script lang="ts">
    import * as RadioGroup from "$lib/components/ui/radio-group";
    import { Label } from "$lib/components/ui/label";

    const languages = [
        { id: 'da', label: 'Dansk', flag: '🇩🇰' },
        { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { id: 'en-uk', label: 'English, UK', flag: '🇬🇧' },
        { id: 'en-us', label: 'English, US', flag: '🇺🇸' },
        { id: 'es', label: 'Español', flag: '🇪🇸' },
        { id: 'es-latam', label: 'Español, LATAM', flag: '🇲🇽' },
        { id: 'fr', label: 'Français', flag: '🇫🇷' },
        { id: 'hr', label: 'Hrvatski', flag: '🇭🇷' },
        { id: 'it', label: 'Italiano', flag: '🇮🇹' },
        { id: 'lt', label: 'Lietuviškai', flag: '🇱🇹' },
        { id: 'hu', label: 'Magyar', flag: '🇭🇺' },
        { id: 'nl', label: 'Nederlands', flag: '🇳🇱' },
        { id: 'no', label: 'Norsk', flag: '🇳🇴' },
        { id: 'pl', label: 'Polski', flag: '🇵🇱' },
        { id: 'pt-br', label: 'Português do Brasil', flag: '🇧🇷' },
        { id: 'ro', label: 'Română', flag: '🇷🇴' },
    ];

    let selectedLanguage = 'fr';
</script>

<section class="px-4 py-2 ml-2 pt-8">
    <h2 class="text-gray-700 text-xs font-bold mt-7 uppercase">Sélectionne une langue</h2>
    <ul role="list" class="space-y-2">
        <RadioGroup.Root bind:value={selectedLanguage}>
            {#each languages as { id, label }}
                <li>
                    <label class="flex items-center space-x-3 cursor-pointer py-2 px-3 rounded-md transition bg-gray-100 hover:bg-gray-200  ">
                        <div class="flex items-center space-x-2">
                            <RadioGroup.Item value={id} id={id} class="w-5 h-5 rounded-full checked:bg-blue-500" />
                            <Label for={id} class="flex items-center space-x-2">
                                <span>{label}</span>
                            </Label>
                        </div>
                    </label>
                </li>
            {/each}
        </RadioGroup.Root>
    </ul>
</section>


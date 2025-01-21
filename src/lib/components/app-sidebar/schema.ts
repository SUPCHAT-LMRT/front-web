import i18next from 'i18next';
import {z} from 'zod';
import {zodI18nMap} from 'zod-i18n-map';
import translation from 'zod-i18n-map/locales/fr/zod.json'

i18next.init({
    lng: 'fr',
    resources: {
        fr: {zod :translation}
    }
});

z.setErrorMap(zodI18nMap);

export const createWorkspaceFormSchema = z.object({
    name: z.string().min(3).max(255),
    type: z.enum(['PUBLIC', 'PRIVATE'])
});

export type CreateWorkspaceForm = typeof createWorkspaceFormSchema;




